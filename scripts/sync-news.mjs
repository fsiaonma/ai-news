import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCourseChapters, moduleIcon } from './course/chapters.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const websiteRoot = path.join(root, 'website')
const srcNewsRoot = path.join(root, 'news')
const srcCourseRoot = path.join(root, 'course')
const newsRoot = path.join(websiteRoot, 'news')
const vitepressDir = path.join(websiteRoot, '.vitepress')

const MONTH_DIR_RE = /^\d{4}-\d{2}$/

// VitePress does not prepend `base` to hrefs written as raw HTML <a> tags,
// so internal links must include it explicitly or they 404 under /ai-news/.
const BASE = '/ai-news/'
const link = (p) => BASE + String(p).replace(/^\/+/, '')

function listMonthDirs() {
  if (!fs.existsSync(srcNewsRoot)) {
    return []
  }

  return fs
    .readdirSync(srcNewsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && MONTH_DIR_RE.test(d.name))
    .map((d) => d.name)
    .sort()
    .reverse()
}

function migrateLegacyMonthDirs() {
  if (!fs.existsSync(srcNewsRoot)) {
    fs.mkdirSync(srcNewsRoot, { recursive: true })
  }

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !MONTH_DIR_RE.test(entry.name)) {
      continue
    }

    const legacyDir = path.join(root, entry.name)
    const targetDir = path.join(srcNewsRoot, entry.name)
    if (fs.existsSync(targetDir)) {
      continue
    }

    fs.renameSync(legacyDir, targetDir)
    console.log(`Migrated ${entry.name}/ → news/${entry.name}/`)
  }
}

function stripMetaBlockquote(content) {
  return content.replace(/^> 截至 [\d-]+。[^\n]*\n\n?/m, '')
}

/** 去掉开源栏目的「来源入口」与文末「来源索引」 */
function cleanNewsMarkdown(content) {
  let body = content
  body = body.replace(/^> 来源入口：[^\n]*\n\n?/gm, '')
  body = body.replace(/^- (?:\*\*)?来源入口(?:\*\*)?：[^\n]*\n/gm, '')
  body = body.replace(/\r?\n## 来源索引\r?\n[\s\S]*$/m, '')
  body = body.replace(/\n{3,}/g, '\n\n')
  return body.trimEnd() + '\n'
}

/** 资讯条目 `- **标签：**` 与 `- 标签：` 转 HTML strong，避免中文冒号后 ** 不渲染 */
function boldNewsFieldLabels(content) {
  let result = content.replace(
    /^(\-\s*)\*\*([^*\n]+：)\*\*/gm,
    '$1<strong>$2</strong>',
  )
  result = result.replace(
    /^(\-\s*)(?!<strong>)([^*\n<]+：)/gm,
    '$1<strong>$2</strong>',
  )
  return result
}

function copyMonthNews(month) {
  const srcDir = path.join(srcNewsRoot, month)
  const destDir = path.join(newsRoot, month)
  fs.mkdirSync(destDir, { recursive: true })

  const files = fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse()

  for (const file of files) {
    const src = path.join(srcDir, file)
    const dest = path.join(destDir, file)
    const content = boldNewsFieldLabels(
      cleanNewsMarkdown(stripMetaBlockquote(fs.readFileSync(src, 'utf8'))),
    )
    fs.writeFileSync(dest, content, 'utf8')
  }

  return files
}

function extractDate(filename) {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : filename.replace(/\.md$/, '')
}

function buildSidebar(months, monthFiles) {
  return months.map((month) => ({
    text: month,
    collapsed: false,
    items: monthFiles[month].map((file) => {
      const slug = file.replace(/\.md$/, '')
      return {
        text: extractDate(file),
        link: `/news/${month}/${slug}`,
      }
    }),
  }))
}

function latestArticle(months, monthFiles) {
  for (const month of months) {
    const files = monthFiles[month]
    if (files.length > 0) {
      const slug = files[0].replace(/\.md$/, '')
      return { month, slug, date: extractDate(files[0]) }
    }
  }
  return null
}

function buildNewsIndexMarkdown(months, monthFiles) {
  const lines = [
    '---',
    'prev: false',
    'next: false',
    '---',
    '',
    '# AI资讯',
    '',
    '<p class="page-lead">每日 AI 模型、产品、论文与行业动态摘要。</p>',
    '',
  ]

  let total = 0
  for (const month of months) {
    const files = monthFiles[month]
    if (files.length === 0) continue
    lines.push('<div class="month-block">')
    lines.push(`<h2 id="${month}">${month}</h2>`)
    lines.push('<ul class="news-list">')
    for (const file of files) {
      const slug = file.replace(/\.md$/, '')
      const date = extractDate(file)
      lines.push(
        `<li><a href="${link(`/news/${month}/${slug}`)}"><time>${date}</time><span>阅读全文</span></a></li>`,
      )
      total++
    }
    lines.push('</ul>')
    lines.push('</div>')
    lines.push('')
  }

  if (total === 0) {
    lines.push('暂无日报，请先在 `news/YYYY-MM/` 下生成 `ai-news-YYYY-MM-DD.md`')
  }

  lines.push('')
  lines.push('')

  return lines.join('\n')
}

function buildCourseChaptersHtml() {
  const chapters = loadCourseChapters(srcCourseRoot)
  const lines = ['<div class="course-parts">']

  for (const ch of chapters) {
    const href = ch.firstSlug
      ? link(`/course/${ch.dir}/${ch.firstSlug}`)
      : link(`/course/${ch.dir}/`)
    const desc = ch.summary ? `${ch.lessonCount} 课 · ${ch.summary}` : `${ch.lessonCount} 课`

    const icon = moduleIcon(ch.dir)

    lines.push('<div class="course-part">')
    lines.push(
      `<div class="course-part-label"><span class="course-part-icon" aria-hidden="true">${icon}</span>${ch.label}</div>`,
    )
    lines.push('<div class="course-part-modules">')
    lines.push(
      `<a class="course-module" href="${href}"><span class="course-module-head"><span class="course-module-icon" aria-hidden="true">${icon}</span><span class="course-module-name">${ch.firstTitle}</span></span><span class="course-module-desc">${desc}</span></a>`,
    )
    lines.push('</div>')
    lines.push('</div>')
  }

  lines.push('</div>')
  return lines
}

const HOME_PILLARS = [
  {
    title: '模型与产品',
    desc: '追踪 OpenAI、Anthropic、Google 等全球一线公司的模型发布、产品迭代与 API 变更，每条资讯优先引用官方博客与公告核验',
  },
  {
    title: '论文与开源',
    desc: '整理 arXiv 论文速递与 GitHub Trending 热门仓库，结合 HelloGitHub 等榜单解读开源生态中的可复现实验与工程进展',
  },
  {
    title: '行业动态',
    desc: '汇总 AI 监管政策、投融资事件、模型安全议题与主流 benchmark 排名变化，按日归档形成可检索的行业快照',
  },
]

function buildIndexMarkdown(months, monthFiles) {
  const latest = latestArticle(months, monthFiles)
  const latestLink = link(latest ? `/news/${latest.month}/${latest.slug}` : '/news/')

  const lines = [
    '---',
    'layout: home',
    '---',
    '',
    '<div class="home">',
    '<div class="home-wrap">',
    '<header class="home-hero">',
    '<p class="home-eyebrow">AI 资讯日报</p>',
    '<h1 class="home-headline">每日 AI 模型、产品、论文与行业动态</h1>',
    '<p class="home-sub">联网检索 · 来源核验 · 按日归档</p>',
    '<div class="home-actions">',
    `<a class="home-btn home-btn--primary" href="${latestLink}">阅读最新日报</a>`,
    `<a class="home-btn home-btn--ghost" href="${link('/news/')}">全部资讯</a>`,
    '</div>',
    '</header>',
    '<div class="home-pillars">',
  ]

  for (const pillar of HOME_PILLARS) {
    lines.push(
      `<div class="home-pillar"><p class="home-pillar-title">${pillar.title}</p><p class="home-pillar-desc">${pillar.desc}</p></div>`,
    )
  }
  lines.push('</div>')

  lines.push('<section class="home-panel">')
  lines.push('<div class="home-panel-head">')
  lines.push('<h2>最新资讯</h2>')
  lines.push(`<a class="home-more" href="${link('/news/')}">全部资讯</a>`)
  lines.push('</div>')
  lines.push('<ul class="news-list">')

  const recent = []
  for (const month of months) {
    for (const file of monthFiles[month]) {
      const slug = file.replace(/\.md$/, '')
      recent.push({ month, slug, date: extractDate(file) })
    }
  }

  if (recent.length === 0) {
    lines.push('<li><span class="home-panel-desc">暂无日报，请先在 news/YYYY-MM/ 下生成。</span></li>')
  } else {
    for (const item of recent.slice(0, 8)) {
      lines.push(
        `<li><a href="${link(`/news/${item.month}/${item.slug}`)}"><time>${item.date}</time><span>阅读全文</span></a></li>`,
      )
    }
  }

  lines.push('</ul>')
  lines.push('</section>')
  lines.push('<section class="home-panel">')
  lines.push('<div class="home-panel-head">')
  lines.push('<div>')
  lines.push('<h2>Agent教程</h2>')
  lines.push('<p class="home-panel-desc">AI Agent 系统课 · 从 API 到可上线 Agent</p>')
  lines.push('</div>')
  lines.push(`<a class="home-more" href="${link('/course/')}">查看课程</a>`)
  lines.push('</div>')
  lines.push(...buildCourseChaptersHtml())
  lines.push('</section>')
  lines.push('</div>')
  lines.push('</div>')
  lines.push('')

  return lines.join('\n')
}

function writeSidebarModule(sidebar) {
  const content = `// Auto-generated by scripts/sync-news.mjs — do not edit\nexport default ${JSON.stringify(sidebar, null, 2)}\n`
  fs.writeFileSync(path.join(vitepressDir, 'sidebar.generated.mjs'), content, 'utf8')
}

function main() {
  fs.mkdirSync(vitepressDir, { recursive: true })

  migrateLegacyMonthDirs()

  if (fs.existsSync(newsRoot)) {
    fs.rmSync(newsRoot, { recursive: true, force: true })
  }

  const months = listMonthDirs()
  const monthFiles = {}

  for (const month of months) {
    monthFiles[month] = copyMonthNews(month)
  }

  const sidebar = buildSidebar(months, monthFiles)
  writeSidebarModule(sidebar)

  fs.writeFileSync(path.join(websiteRoot, 'index.md'), buildIndexMarkdown(months, monthFiles), 'utf8')
  fs.writeFileSync(
    path.join(newsRoot, 'index.md'),
    buildNewsIndexMarkdown(months, monthFiles),
    'utf8',
  )

  const total = months.reduce((n, m) => n + monthFiles[m].length, 0)
  console.log(`Synced ${total} article(s) from news/ (${months.length} month folder(s)).`)
}

main()
