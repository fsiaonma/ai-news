/**
 * 资讯条目布局：日期右上角 + 摘要正文 + 来源
 * 用法：node scripts/reformat-news-layout.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderSections } from './news-sections.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const newsRoot = path.join(root, 'news')

function stripHtml(s) {
  return s.replace(/<\/?strong>/g, '').replace(/\*\*/g, '').trim()
}

function extractField(block, labels) {
  for (const label of labels) {
    const re = new RegExp(
      `(?:^|\\n)(?:-\\s*)?(?:<strong>)?\\*?\\*?${label}\\*?\\*?(?:</strong>)?[:：]\\s*(.+)$`,
      'm',
    )
    const m = block.match(re)
    if (m) return stripHtml(m[1].trim())
  }
  return ''
}

function primaryDate(dateText) {
  const m = dateText.match(/\d{4}-\d{2}-\d{2}/)
  return m ? m[0] : dateText.replace(/。$/, '')
}

function normalizeSourceHtml(sourceHtml) {
  let s = sourceHtml.trim()
  while (/^(?:<strong>)?来源：(?:<\/strong>)?\s*/i.test(s)) {
    s = s.replace(/^(?:<strong>)?来源：(?:<\/strong>)?\s*/i, '').trim()
  }
  return s
}

function parseItem(block) {
  const title = block.match(/^### ([^\n]+)/)?.[1]?.trim()
  if (!title) return null

  const imageMatch = block.match(/!\[([^\]]*)\]\(([^)]+)\)/)
  const image = imageMatch ? { alt: imageMatch[1] || title, url: imageMatch[2] } : null

  const date =
    block.match(/<time class="news-item-date"[^>]*>([^<]+)<\/time>/)?.[1] ||
    extractField(block, ['日期'])
  const summary =
    block.match(/<p class="news-item-summary">([\s\S]*?)<\/p>/)?.[1]?.trim() ||
    extractField(block, ['摘要', '事件摘要'])

  let sourceHtml = block.match(/<p class="news-item-source">([\s\S]*?)<\/p>/)?.[1]
  if (sourceHtml) {
    sourceHtml = normalizeSourceHtml(sourceHtml)
  } else {
    const sourceRaw = extractField(block, ['来源'])
    const link = sourceRaw.match(/\[([^\]]+)\]\(([^)]+)\)/)
    sourceHtml = link
      ? `<a href="${link[2]}">${link[1]}</a>`
      : sourceRaw
        ? normalizeSourceHtml(sourceRaw)
        : '—'
  }

  if (!date && !summary && sourceHtml === '—') return null

  return { title, image, date, summary, sourceHtml }
}

function renderItem({ title, image, date, summary, sourceHtml }) {
  const dateAttr = primaryDate(date)
  const shortDate = /\d{4}-\d{2}-\d{2}/.test(dateAttr) ? dateAttr : date.replace(/。$/, '')
  const fullDate = date.replace(/。$/, '')
  const titleAttr =
    fullDate !== shortDate ? ` title="${fullDate.replace(/"/g, '&quot;')}"` : ''

  const imageBlock = image ? `\n\n![${image.alt}](${image.url})` : ''
  const summaryBlock = summary
    ? `\n\n<p class="news-item-summary">${summary}</p>`
    : ''

  return `<div class="news-item">

### ${title}

<time class="news-item-date" datetime="${dateAttr}"${titleAttr}>${shortDate}</time>${imageBlock}${summaryBlock}

<p class="news-item-source"><strong>来源：</strong> ${sourceHtml}</p>

</div>
`
}

function parseReport(content) {
  const reportDate = content.match(/^# AI 资讯日报：(\d{4}-\d{2}-\d{2})/m)?.[1] || ''
  const sections = []
  const parts = content.split(/\n(?=## )/)

  for (const part of parts) {
    const secMatch = part.match(/^## ([^\n]+)\n([\s\S]*)/)
    if (!secMatch) continue
    const name = secMatch[1].trim()
    const body = secMatch[2]
    const chunks = body.split(/\n(?=<div class="news-item">|\n### )/).filter(Boolean)
    const items = []
    for (const chunk of chunks) {
      const item = parseItem(chunk.trim())
      if (item) items.push(item)
    }
    sections.push({ name, items })
  }

  return { reportDate, sections }
}

function renderReport({ reportDate, sections }) {
  return renderSections(reportDate, sections, renderItem)
}

function main() {
  let count = 0
  for (const month of fs.readdirSync(newsRoot).filter((d) => /^\d{4}-\d{2}$/.test(d))) {
    const dir = path.join(newsRoot, month)
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const fp = path.join(dir, file)
      const raw = fs.readFileSync(fp, 'utf8')
      const out = renderReport(parseReport(raw))
      fs.writeFileSync(fp, out, 'utf8')
      count++
      console.log(`Reformatted: ${month}/${file}`)
    }
  }
  console.log(`Done. ${count} file(s).`)
}

main()
