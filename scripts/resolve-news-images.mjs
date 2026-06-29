/**
 * 从来源链接解析 og:image，批量更新 news/ 日报配图（HTTPS 外链）
 * 无图或请求失败时不使用兜底图，直接省略配图行
 * 用法：node scripts/resolve-news-images.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const newsRoot = path.join(root, 'news')

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

/** 历史兜底/占位图，一律移除 */
const STRIP_IMAGE =
  /the_verge_social_share|global-social-marketing|github-logo-|apple-touch-icon|google-og-image|arxiv-logo-fb|chatgpt\/share-og|favicon\.ico|hellogithub\.com\/images\/logo|cropped-favicon-gradient|reuters-logo\.png|default_article_june|verge-placeholder/i

function firstSourceUrl(sourceLine) {
  const m = sourceLine.match(/\]\((https?:\/\/[^)]+)\)/)
  return m ? m[1] : null
}

function githubRepoFromUrl(url) {
  const m = url.match(/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/)
  if (!m) return null
  const repo = m[1].replace(/\/+$/, '').split('/').slice(0, 2).join('/')
  if (['trending', 'periodical', 'repository'].includes(repo.split('/')[1])) return null
  return repo
}

function githubRepoFromTitle(title) {
  const m = title.trim().match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/)
  return m ? m[1] : null
}

function extractOgImage(html) {
  const patterns = [
    /property=["']og:image(?::secure_url)?["']\s+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["']\s+property=["']og:image(?::secure_url)?["']/i,
    /name=["']twitter:image(?::src)?["']\s+content=["']([^"']+)["']/i,
    /"og:image"\s*:\s*"([^"]+)"/i,
    /"twitter:image"\s*:\s*"([^"]+)"/i,
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) return m[1].replace(/\\u002F/g, '/').replace(/&amp;/g, '&')
  }
  return null
}

function shouldStrip(url) {
  return !url || STRIP_IMAGE.test(url)
}

async function headOk(url, cache) {
  if (!url?.startsWith('http')) return false
  if (cache.has(`ok:${url}`)) return cache.get(`ok:${url}`)
  const opts = {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
  }
  try {
    let res = await fetch(url, { ...opts, method: 'HEAD' })
    let ct = res.headers.get('content-type') || ''
    if (res.ok && ct.startsWith('image/')) {
      cache.set(`ok:${url}`, true)
      return true
    }
    res = await fetch(url, { ...opts, method: 'GET', headers: { ...opts.headers, Range: 'bytes=0-0' } })
    ct = res.headers.get('content-type') || ''
    const ok = res.ok && ct.startsWith('image/')
    cache.set(`ok:${url}`, ok)
    return ok
  } catch {
    cache.set(`ok:${url}`, false)
    return false
  }
}

async function resolveImage(sourceLine, title, cache) {
  const url = firstSourceUrl(sourceLine)
  if (!url) return null

  const repo = githubRepoFromUrl(url) || githubRepoFromTitle(title)
  if (repo) {
    const gh = `https://opengraph.githubassets.com/1/${repo}`
    if (await headOk(gh, cache)) return gh
  }

  if (cache.has(url)) return cache.get(url)

  let image = null
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    })
    if (res.ok) {
      const html = await res.text()
      image = extractOgImage(html)
      if (image && !image.startsWith('http')) {
        image = new URL(image, url).href
      }
    }
  } catch {
    /* network */
  }

  if (image && !shouldStrip(image) && (await headOk(image, cache))) {
    cache.set(url, image)
    return image
  }

  cache.set(url, null)
  return null
}

function parseItems(content) {
  const items = []
  const re =
    /<div class="news-item">\n\n### ([^\n]+)\n\n<time class="news-item-date" datetime="([^"]*)">([^<]*)<\/time>(?:\n\n!\[[^\]]*\]\(([^)]*)\))?(?:\n\n<p class="news-item-summary">([\s\S]*?)<\/p>)?\n\n<p class="news-item-source"><strong>来源：<\/strong> ([\s\S]*?)<\/p>\n\n<\/div>/g
  let m
  while ((m = re.exec(content)) !== null) {
    items.push({
      title: m[1],
      dateAttr: m[2],
      date: m[3],
      currentImage: m[4] || null,
      summary: m[5] || '',
      sourceHtml: m[6].trim(),
      start: m.index,
      full: m[0],
    })
  }
  return items
}

function buildBlock({ title, date, dateAttr, image, summary, sourceHtml }) {
  const imageBlock = image ? `\n\n![${title}](${image})` : ''
  const summaryBlock = summary ? `\n\n<p class="news-item-summary">${summary}</p>` : ''
  return `<div class="news-item">

### ${title}

<time class="news-item-date" datetime="${dateAttr}">${date}</time>${imageBlock}${summaryBlock}

<p class="news-item-source"><strong>来源：</strong> ${sourceHtml}</p>

</div>
`
}

async function processFile(filePath, cache) {
  let content = fs.readFileSync(filePath, 'utf8')
  const items = parseItems(content)
  if (!items.length) {
    console.log(`No items: ${path.basename(filePath)}`)
    return 0
  }

  let updated = 0
  for (const item of [...items].reverse()) {
    const sourceLine = item.sourceHtml
    let image = await resolveImage(sourceLine, item.title, cache)

    if (!image && item.currentImage && !shouldStrip(item.currentImage)) {
      if (await headOk(item.currentImage, cache)) image = item.currentImage
    }

    const newBlock = buildBlock({ ...item, image: image || null })
    if (newBlock !== item.full) {
      content = content.slice(0, item.start) + newBlock + content.slice(item.start + item.full.length)
      updated++
    }
    process.stdout.write('.')
  }
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(` ${path.basename(filePath)}: ${updated}/${items.length}`)
  return updated
}

async function main() {
  const cache = new Map()
  let total = 0
  const months = fs.readdirSync(newsRoot).filter((d) => /^\d{4}-\d{2}$/.test(d))
  for (const month of months) {
    const files = fs
      .readdirSync(path.join(newsRoot, month))
      .filter((f) => f.endsWith('.md'))
      .sort()
    for (const file of files) {
      total += await processFile(path.join(newsRoot, month, file), cache)
    }
  }
  console.log(`Done. ${total} item(s) updated.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
