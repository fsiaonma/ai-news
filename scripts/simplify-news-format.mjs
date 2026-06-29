/**
 * 将 news/ 下日报转为精简格式：日期 + 事件摘要 + 来源 + 配图
 * 用法：node scripts/simplify-news-format.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NEWS_SECTIONS, renderSections } from './news-sections.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const newsRoot = path.join(root, 'news')

function githubRepoFromTitle(title) {
  const m = title.trim().match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/)
  return m ? m[1] : null
}

function githubOgFromSources(sourceText) {
  const m = sourceText.match(/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/)
  if (!m) return null
  const repo = m[1].replace(/\/+$/, '').split('/').slice(0, 2).join('/')
  if (['trending', 'periodical', 'repository'].includes(repo.split('/')[1])) return null
  return `https://opengraph.githubassets.com/1/${repo}`
}

function pickImage(title, sourceText) {
  const gh =
    githubOgFromSources(sourceText) ||
    (githubRepoFromTitle(title)
      ? `https://opengraph.githubassets.com/1/${githubRepoFromTitle(title)}`
      : null)
  return gh || null
}

function stripHtml(s) {
  return s.replace(/<\/?strong>/g, '').replace(/\*\*/g, '').trim()
}

function extractField(block, labels) {
  for (const label of labels) {
    const re = new RegExp(
      `^[-*]\\s*(?:<strong>)?\\*?\\*?${label}\\*?\\*?(?:</strong>)?[:：]\\s*(.+)$`,
      'm',
    )
    const m = block.match(re)
    if (m) return stripHtml(m[1].trim())
  }
  return ''
}

function firstLink(text) {
  const m = text.match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (m) return { label: m[1], url: m[2] }
  const url = text.match(/https?:\/\/[^\s)]+/)
  if (url) return { label: url[0], url: url[0] }
  return null
}

function buildSummary(block, reportDate) {
  const event = extractField(block, ['事件', '主题', '观察'])
  const why = extractField(block, ['为什么重要'])
  const hot = extractField(block, ['项目用途', '热度信号'])

  let summary = event || hot
  if (why && summary && !summary.includes(why.slice(0, 20))) {
    summary = `${summary} ${why}`
  }
  if (!summary) {
    summary = block
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('-') && !l.startsWith('###'))
      .slice(0, 2)
      .join(' ')
  }
  summary = stripHtml(summary).replace(/\s+/g, ' ').trim()
  if (summary.length > 280) summary = `${summary.slice(0, 277)}…`
  return summary
}

function parseReport(content, filename) {
  const reportDate =
    filename.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '未知日期'
  const body = content.replace(/^# AI 资讯日报[^\n]*\n+/m, '')
  body.replace(/^>[^\n]*\n\n?/m, '')

  const sections = []
  let currentSection = null
  let currentItems = []

  const lines = content.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('## ') && !line.startsWith('## 来源')) {
      if (currentSection && currentItems.length) {
        sections.push({ name: currentSection, items: currentItems })
      }
      currentSection = line.replace(/^##\s+/, '').trim()
      currentItems = []
      i++
      continue
    }
    if (line.startsWith('### ') && currentSection) {
      const title = line.replace(/^###\s+\d+\.\s*/, '').trim()
      i++
      const blockLines = []
      while (i < lines.length && !lines[i].startsWith('### ') && !lines[i].startsWith('## ')) {
        blockLines.push(lines[i])
        i++
      }
      const block = blockLines.join('\n')
      const dateRaw = extractField(block, ['日期'])
      const date = dateRaw || reportDate
      const sourceRaw = extractField(block, ['来源'])
      const summary = buildSummary(block, reportDate)
      if (!summary && !sourceRaw) continue
      currentItems.push({
        title,
        date,
        summary: summary || title,
        source: sourceRaw,
        section: currentSection,
      })
      continue
    }
    i++
  }
  if (currentSection && currentItems.length) {
    sections.push({ name: currentSection, items: currentItems })
  }

  return { reportDate, sections }
}

function primaryDate(dateText) {
  const m = dateText.match(/\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : dateText.replace(/。$/, '')
}

function renderItem(item) {
  const image = pickImage(item.title, item.source)
  const link = firstLink(item.source)
  const sourceHtml = link
    ? `<a href="${link.url}">${link.label}</a>`
    : item.source || '—'
  const imageBlock = image ? `\n\n![${item.title}](${image})` : ''
  const dateAttr = primaryDate(item.date)
  const fullDate = item.date.replace(/。$/, '')
  const shortDate = /\d{4}-\d{2}-\d{2}/.test(dateAttr) ? dateAttr : fullDate
  const titleAttr =
    fullDate !== shortDate ? ` title="${fullDate.replace(/"/g, '&quot;')}"` : ''

  return `<div class="news-item">

### ${item.title}

<time class="news-item-date" datetime="${dateAttr}"${titleAttr}>${shortDate}</time>${imageBlock}

<p class="news-item-summary">${item.summary}</p>

<p class="news-item-source"><strong>来源：</strong> ${sourceHtml}</p>

</div>
`
}

function renderReport({ reportDate, sections }) {
  const filtered = sections.filter((s) => NEWS_SECTIONS.includes(s.name))
  return renderSections(reportDate, filtered, renderItem)
}

function main() {
  const months = fs
    .readdirSync(newsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{4}-\d{2}$/.test(d.name))
    .map((d) => d.name)

  let count = 0
  for (const month of months) {
    const dir = path.join(newsRoot, month)
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const fp = path.join(dir, file)
      const raw = fs.readFileSync(fp, 'utf8')
      if (raw.includes('<strong>事件摘要：</strong>') && !raw.includes('<strong>为什么重要：</strong>')) {
        console.log(`Skip (already simplified): ${month}/${file}`)
        continue
      }
      if (raw.includes('class="news-item"')) {
        console.log(`Skip (layout format): ${month}/${file}`)
        continue
      }
      const parsed = parseReport(raw, file)
      const out = renderReport(parsed)
      fs.writeFileSync(fp, out, 'utf8')
      console.log(`Simplified: ${month}/${file} (${parsed.sections.reduce((n, s) => n + s.items.length, 0)} items)`)
      count++
    }
  }
  console.log(`Done. ${count} file(s) updated.`)
}

main()
