/**
 * 将行业动态中就业/招聘/人才类条目迁入「就业趋势」
 * 用法：node scripts/migrate-employment-items.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NEWS_SECTIONS } from './news-sections.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const newsRoot = path.join(root, 'news')

const EMPLOYMENT_RE =
  /人才|裁员|layoffs?|招聘|hiring-agent|就业|岗位|薪资|salary|token rationing|员工.*AI|AI.*员工|Jumper|Shazeer|人才持续流失|workforce|Hiring Lab|Levels\.fyi|猎聘|Boss直聘|组织调整|加盟 OpenAI|加盟 Anthropic|离开 DeepMind|离开 Google|成本治理.*员工|employees-from-maxing/i

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, '').replace(/\*\*/g, '').trim()
}

function parseItemBlock(block) {
  const title = block.match(/^### ([^\n]+)/m)?.[1]?.trim()
  if (!title) return null
  const summary =
    block.match(/<p class="news-item-summary">([\s\S]*?)<\/p>/)?.[1]?.trim() || ''
  return { title, summary, raw: block.trim() }
}

function isEmploymentItem(item) {
  const title = item.title
  const summary = stripHtml(item.summary)
  const text = `${title} ${summary}`

  if (/算力短缺|compute shortage|hyperscaler|政府 frontier|Reid Hoffman|Five Eyes|Superhuman|Human Consent|起诉|诉讼|监管|政策|融资|市值纳入/i.test(title)) {
    return false
  }
  if (/Gemini 3\.5 Pro 错过|延至 7 月/i.test(title) && !/人才|流失/i.test(title)) {
    return false
  }

  return EMPLOYMENT_RE.test(text)
}

function parseReport(content) {
  const reportDate = content.match(/^# AI 资讯日报：(\d{4}-\d{2}-\d{2})/m)?.[1] || ''
  const byName = new Map(NEWS_SECTIONS.map((n) => [n, []]))
  const parts = content.split(/\n(?=## )/)

  for (const part of parts) {
    const m = part.match(/^## ([^\n]+)\n([\s\S]*)/)
    if (!m || !byName.has(m[1].trim())) continue
    const name = m[1].trim()
    const body = m[2]
    const chunks = body
      .split(/(?=<div class="news-item">)/)
      .map((c) => c.trim())
      .filter((c) => c.includes('class="news-item"'))
    for (const chunk of chunks) {
      const item = parseItemBlock(chunk)
      if (item) byName.get(name).push(item)
    }
  }

  return { reportDate, byName }
}

function migrate(byName) {
  const industry = byName.get('行业动态') || []
  const employment = byName.get('就业趋势') || []
  const keep = []
  const moved = []

  for (const item of industry) {
    if (isEmploymentItem(item)) {
      moved.push(item)
    } else {
      keep.push(item)
    }
  }

  byName.set('行业动态', keep)
  byName.set('就业趋势', [...employment.filter((i) => i.title !== '（本日无新条目）'), ...moved])
  return moved.length
}

function renderReport(reportDate, byName) {
  const lines = [`# AI 资讯日报：${reportDate}`, '', `> 截至 ${reportDate}。`, '']

  for (const name of NEWS_SECTIONS) {
    const items = byName.get(name) || []
    lines.push(`## ${name}`, '')
    if (!items.length) {
      lines.push('（本日无新条目）', '')
      continue
    }
    for (const item of items) {
      lines.push(item.raw, '')
    }
  }

  return `${lines.join('\n').trimEnd()}\n`
}

function main() {
  let totalMoved = 0
  for (const month of fs.readdirSync(newsRoot).filter((d) => /^\d{4}-\d{2}$/.test(d))) {
    const dir = path.join(newsRoot, month)
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const fp = path.join(dir, file)
      const { reportDate, byName } = parseReport(fs.readFileSync(fp, 'utf8'))
      const n = migrate(byName)
      if (n > 0) {
        fs.writeFileSync(fp, renderReport(reportDate, byName), 'utf8')
        console.log(`${month}/${file}: moved ${n} item(s)`)
        totalMoved += n
      }
    }
  }
  console.log(totalMoved ? `Done. ${totalMoved} item(s) moved.` : 'No items to move.')
}

main()
