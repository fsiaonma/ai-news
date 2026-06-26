import fs from 'node:fs'
import path from 'node:path'

const CHAPTER_DIGIT_CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

export function chapterNumberLabel(n) {
  if (n === 0) return '前置选修'
  if (n < 10) return `第${CHAPTER_DIGIT_CN[n]}章`
  if (n === 10) return '第十章'
  if (n < 20) return `第十${CHAPTER_DIGIT_CN[n - 10]}章`
  return `第${n}章`
}

export function chapterSidebarTitle(chapterNum, short) {
  if (chapterNum === 0) return `前置选修 · ${short}`
  return `${chapterNumberLabel(chapterNum)} · ${short}`
}

export function moduleChapterNumber(dir) {
  const m = dir.match(/^(\d+)-/)
  return m ? Number(m[1]) : 0
}

const MODULE_ICONS = {
  '00-prereq': '🐍',
  '01-agent-cognition': '🧠',
  '02-api-prompt': '⚡',
  '03-tools-mcp': '🔧',
  '04-rag-memory': '📚',
  '05-agent-engineering': '🤖',
  '06-frameworks': '🏗️',
  '07-production': '📊',
  '08-agent-projects': '🎯',
  '09-agent-ide': '💻',
}

export function moduleIcon(dir) {
  return MODULE_ICONS[dir] ?? '📘'
}

function listLessonSlugs(moduleDir) {
  if (!fs.existsSync(moduleDir)) {
    return []
  }
  return fs
    .readdirSync(moduleDir)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .map((f) => f.replace(/\.md$/, ''))
}

function readLessonTitle(moduleDir, slug) {
  const raw = fs.readFileSync(path.join(moduleDir, slug + '.md'), 'utf8')
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (fm) {
    const titleMatch = fm[1].match(/^title:\s*(?:"([^"]*)"|'([^']*)'|(.+))$/m)
    if (titleMatch) {
      return (titleMatch[1] ?? titleMatch[2] ?? titleMatch[3]?.trim()) || slug
    }
  }
  const h1 = raw.match(/^#\s+(.+)$/m)
  return h1?.[1]?.trim() ?? slug
}

function chapterMetaFromDir(courseRoot, meta) {
  const dir = meta.dir
  const moduleDir = path.join(courseRoot, dir)
  const slugs = listLessonSlugs(moduleDir)
  const chapterNum = moduleChapterNumber(dir)
  const short = meta.short ?? meta.title ?? dir
  const firstSlug = slugs[0]
  const firstTitle = firstSlug ? readLessonTitle(moduleDir, firstSlug) : short

  return {
    dir,
    chapterNum,
    label: chapterSidebarTitle(chapterNum, short),
    short,
    summary: meta.summary ?? '',
    lessonCount: slugs.length,
    firstSlug,
    firstTitle,
  }
}

export function loadCourseChapters(courseRoot) {
  const structurePath = path.join(courseRoot, 'structure.json')
  if (!fs.existsSync(structurePath)) {
    return []
  }

  const structure = JSON.parse(fs.readFileSync(structurePath, 'utf8'))
  const chapters = []

  for (const part of structure.parts) {
    for (const mod of part.modules) {
      chapters.push(chapterMetaFromDir(courseRoot, mod))
    }
  }

  return chapters
}

/** 将「学习目标」转为 h1 下方信息框（与所属模块同款 blockquote） */
function formatLearningObjectives(content) {
  return content.replace(
    /^## 学习目标\r?\n\r?\n((?:- .+\r?\n?)+)/gm,
    (_, list) => {
      const quotedList = list
        .trimEnd()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
      return `> 🎯 学习目标\n>\n${quotedList}\n\n`
    },
  )
}

/** 去掉课时文中的「预计用时」「开始之前」及引言里的时长标注 */
export function cleanLessonMarkdown(content) {
  let body = content
  body = formatLearningObjectives(body)
  body = body.replace(/^## 预计用时\s*\r?\n[\s\S]*?(?=^## )/gm, '')
  body = body.replace(/^## 开始之前\s*\r?\n[\s\S]*?(?=^## )/gm, '')
  body = body.replace(/^## 预计用时\s*\r?\n[\s\S]*$/m, '')
  body = body.replace(/^## 开始之前\s*\r?\n[\s\S]*$/m, '')
  body = body.replace(/\r?\n---\r?\n\r?\n## 课程导航[\s\S]*$/m, '')
  body = body.replace(/\r?\n## 课程导航[\s\S]*$/m, '')
  body = body.replace(/^>[^\n]*所属模块[^\n]*\r?\n\r?\n?/gm, '')
  body = body.replace(/(>[^\n]*) · 约 [\d一二三四五六七八九十百]+ 分钟/g, '$1')
  body = body.replace(/\n{3,}/g, '\n\n')
  return body
}
