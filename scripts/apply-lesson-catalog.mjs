import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  LESSON_CATALOG,
  lessonHeading,
} from './course/lesson-catalog.mjs'

const courseRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'course')

function updateFrontmatterTitle(raw, title) {
  if (!raw.match(/^---\r?\n/)) {
    return raw
  }
  return raw.replace(
    /^title:\s*(?:"[^"]*"|'[^']*'|.+)$/m,
    `title: "${title.replace(/"/g, '\\"')}"`,
  )
}

function updateLessonH1(raw, heading) {
  const fm = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)
  if (!fm) return raw
  const rest = raw.slice(fm[0].length)
  const lines = rest.split('\n')
  let replaced = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ') && !replaced) {
      lines[i] = `# ${heading}`
      replaced = true
      break
    }
  }
  if (!replaced) {
    lines.unshift('', `# ${heading}`, '')
  }
  return fm[0] + lines.join('\n')
}

let updated = 0
for (const [rel, title] of Object.entries(LESSON_CATALOG)) {
  const filePath = path.join(courseRoot, rel)
  if (!fs.existsSync(filePath)) {
    console.warn('Missing:', rel)
    continue
  }
  const heading = lessonHeading(null, title)
  let raw = fs.readFileSync(filePath, 'utf8')
  const next = updateLessonH1(updateFrontmatterTitle(raw, title), heading)
  if (next !== raw) {
    fs.writeFileSync(filePath, next, 'utf8')
    updated++
  }
}

console.log(`Updated ${updated} lesson file(s) with catalog titles.`)

function updateModuleIndexTables() {
  let indexUpdated = 0
  for (const moduleDir of fs.readdirSync(courseRoot, { withFileTypes: true })) {
    if (!moduleDir.isDirectory()) continue
    const indexPath = path.join(courseRoot, moduleDir.name, 'index.md')
    if (!fs.existsSync(indexPath)) continue
    let raw = fs.readFileSync(indexPath, 'utf8')
    let next = raw.replace(/^\| 课次 \| 标题 \| 说明 \|$/m, '| 标题 | 说明 |')
    next = next.replace(/^\| 课次 \| 标题 \|$/m, '| 标题 |')

    next = next.replace(
      /^\| \[([^\]]+)\]\(\.\/([^)]+)\) \| ([^|]+) \| (.+) \|$/gm,
      (match, _link, file, title, rest) => {
        const relKey = `${moduleDir.name}/${file}`
        const catalogTitle = LESSON_CATALOG[relKey] || title.trim()
        return `| [${catalogTitle}](./${file}) |${rest}`
      },
    )
    next = next.replace(
      /^\| \[([^\]]+)\]\(\.\/([^)]+)\) \| ([^|]+) \|$/gm,
      (match, _link, file, title) => {
        const relKey = `${moduleDir.name}/${file}`
        const catalogTitle = LESSON_CATALOG[relKey] || title.trim()
        return `| [${catalogTitle}](./${file}) |`
      },
    )

    if (next !== raw) {
      fs.writeFileSync(indexPath, next, 'utf8')
      indexUpdated++
    }
  }
  console.log(`Updated ${indexUpdated} module index table(s).`)
}

const COURSE_HOME_LESSONS = [
  '00-prereq/0.1-python基础.md',
  '01-agent-cognition/1.1-ai-ml-dl-llm.md',
  '02-api-prompt/2.1-远程API与本地部署.md',
  '03-tools-mcp/3.1-function-calling.md',
  '04-rag-memory/4.1-rag解决什么问题.md',
  '05-agent-engineering/5.1-chatbot-copilot-agent.md',
  '06-frameworks/6.1-langchain基本介绍.md',
  '07-production/7.1-eval与回归测试.md',
  '08-agent-projects/8.1-智能翻译助手.md',
  '09-agent-ide/9.1-agent-ide-概览.md',
]

function updateCourseHomeIndex() {
  const indexPath = path.join(courseRoot, 'index.md')
  if (!fs.existsSync(indexPath)) return
  let raw = fs.readFileSync(indexPath, 'utf8')
  let next = raw
  for (const rel of COURSE_HOME_LESSONS) {
    const title = LESSON_CATALOG[rel]
    if (!title) continue
    const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    next = next.replace(
      new RegExp(`\\[([^\\]]+)\\]\\(\\./${escaped.replace(/\//g, '\\/')}\\)`, 'g'),
      `[${title}](./${rel})`,
    )
  }
  next = next.replace(
    /2\. \*\*每章做 Lab\*\*：第二章 Lab 1、第三章 Lab 2、第四章 Lab 3\/4、第六章 Lab 5。/,
    '2. **每章做实战**：第二章流式 API、第三章 Function Calling、第四章会话与 RAG、第六章 LangGraph。',
  )
  if (next !== raw) {
    fs.writeFileSync(indexPath, next, 'utf8')
    console.log('Updated course/index.md.')
  }
}

function updateModuleIntroLabRefs() {
  const replacements = [
    [/本章 \*\*7\*\* 课 \+ \*\*Lab 1\*\*：/g, '本章 **7** 课 + **实战**：'],
    [/本章 \*\*7\*\* 课 \+ \*\*Lab 2\*\*：/g, '本章 **7** 课 + **实战**：'],
    [/本章 \*\*8\*\* 课 \+ \*\*Lab 3\/4\*\*：/g, '本章 **8** 课 + **实战**：'],
    [/本章 \*\*8\*\* 课 \+ \*\*Lab 5\*\*：/g, '本章 **8** 课 + **实战**：'],
  ]
  let count = 0
  for (const moduleDir of fs.readdirSync(courseRoot, { withFileTypes: true })) {
    if (!moduleDir.isDirectory()) continue
    const indexPath = path.join(courseRoot, moduleDir.name, 'index.md')
    if (!fs.existsSync(indexPath)) continue
    let raw = fs.readFileSync(indexPath, 'utf8')
    let next = raw
    for (const [re, rep] of replacements) {
      next = next.replace(re, rep)
    }
    if (next !== raw) {
      fs.writeFileSync(indexPath, next, 'utf8')
      count++
    }
  }
  if (count) console.log(`Updated Lab refs in ${count} module intro(s).`)
}

updateModuleIndexTables()
updateCourseHomeIndex()
updateModuleIntroLabRefs()
