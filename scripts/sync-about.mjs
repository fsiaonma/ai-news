import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcAboutRoot = path.join(root, 'about')
const websiteRoot = path.join(root, 'website')
const aboutPageRoot = path.join(websiteRoot, 'about')
const publicAboutRoot = path.join(websiteRoot, 'public', 'about')
const assetsRoot = path.join(srcAboutRoot, 'assets')

const GITHUB_ORG = 'Z-TEAM-Z'
const MEMBERS_START = '<!-- MEMBERS_START -->'
const MEMBERS_END = '<!-- MEMBERS_END -->'

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function githubHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ai-news-sync',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchJson(url, token, { retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const res = await fetch(url, { headers: githubHeaders(token) })
    if (res.ok) return res.json()

    if ((res.status === 403 || res.status === 429) && attempt < retries) {
      const reset = Number(res.headers.get('x-ratelimit-reset') || 0)
      const waitMs = reset ? Math.max(reset * 1000 - Date.now(), 1000) : 2000 * (attempt + 1)
      console.warn(`${url} → ${res.status}, retry in ${Math.ceil(waitMs / 1000)}s`)
      await sleep(waitMs)
      continue
    }

    const err = new Error(`${url} → ${res.status}`)
    err.status = res.status
    throw err
  }
  throw new Error(`${url} → exhausted retries`)
}

async function paginateLogins(url, token, { retries = 2 } = {}) {
  const logins = []
  let page = 1
  while (true) {
    const batch = await fetchJson(`${url}${url.includes('?') ? '&' : '?'}per_page=100&page=${page}`, token, {
      retries,
    })
    if (!Array.isArray(batch) || batch.length === 0) break
    for (const member of batch) {
      if (member?.login) logins.push(member.login)
    }
    if (batch.length < 100) break
    page += 1
  }
  return logins
}

async function fetchOrgMemberLogins(token) {
  const base = `https://api.github.com/orgs/${GITHUB_ORG}`
  let authLogins = []
  let publicLogins = []

  if (token) {
    try {
      authLogins = await paginateLogins(`${base}/members`, token)
    } catch (err) {
      console.warn(`Org members (auth) failed: ${err.message}`)
    }
  }

  try {
    publicLogins = await paginateLogins(`${base}/public_members`, token, { retries: 0 })
  } catch (err) {
    console.warn(`Org public_members failed: ${err.message}`)
  }

  return { authLogins, publicLogins }
}

function loadJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return []
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!Array.isArray(data)) return []
  return data
    .map((item) => (typeof item === 'string' ? item : item?.login))
    .filter(Boolean)
}

function mergeLogins({ authLogins, publicLogins, seedLogins, order }) {
  const merged = [...new Set([...authLogins, ...publicLogins, ...seedLogins])]
  if (!order.length) return merged.sort((a, b) => a.localeCompare(b))

  const rank = new Map(order.map((login, index) => [login, index]))
  return merged.sort((a, b) => {
    const ai = rank.has(a) ? rank.get(a) : Number.MAX_SAFE_INTEGER
    const bi = rank.has(b) ? rank.get(b) : Number.MAX_SAFE_INTEGER
    if (ai !== bi) return ai - bi
    return a.localeCompare(b)
  })
}

async function fetchUserProfile(login, token) {
  try {
    const user = await fetchJson(`https://api.github.com/users/${login}`, token, { retries: 0 })
    return {
      login,
      name: user.name?.trim() || login,
    }
  } catch (err) {
    console.warn(`Profile fetch failed for ${login}: ${err.message}`)
    return { login, name: login }
  }
}

async function ensureAvatar(login) {
  fs.mkdirSync(assetsRoot, { recursive: true })
  const dest = path.join(assetsRoot, `member-${login}.png`)
  const res = await fetch(`https://github.com/${login}.png?size=160`)
  if (!res.ok) {
    console.warn(`Avatar fetch failed for ${login}: ${res.status}`)
    return null
  }
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buf)
  return dest
}

function buildMembersHtml(members) {
  const cards = members
    .map(({ name, login }) => {
      const label = escapeHtml(name || login)
      return `<a class="about-member" href="https://github.com/${login}" target="_blank" rel="noopener noreferrer" title="${label}">
<img src="/about/member-${login}.png" alt="${label}" width="44" height="44" />
</a>`
    })
    .join('\n\n')

  return `<div class="about-members">

${cards}

</div>`
}

function injectMembers(indexMd, membersHtml) {
  const start = indexMd.indexOf(MEMBERS_START)
  const end = indexMd.indexOf(MEMBERS_END)
  if (start === -1 || end === -1 || end <= start) {
    console.warn('about/index.md missing MEMBERS markers — skip member injection.')
    return indexMd
  }
  const before = indexMd.slice(0, start + MEMBERS_START.length)
  const after = indexMd.slice(end)
  return `${before}\n${membersHtml}\n${after}`
}

async function main() {
  if (!fs.existsSync(srcAboutRoot)) {
    console.warn('No about/ at repo root — skip about sync.')
    return
  }

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
  const seedLogins = loadJsonArray(path.join(srcAboutRoot, 'members.json'))
  const order = loadJsonArray(path.join(srcAboutRoot, 'members.order.json'))

  const { authLogins, publicLogins } = await fetchOrgMemberLogins(token)
  const logins = mergeLogins({ authLogins, publicLogins, seedLogins, order })

  const members = []
  for (const login of logins) {
    members.push(await fetchUserProfile(login, token))
    await sleep(80)
  }

  fs.mkdirSync(srcAboutRoot, { recursive: true })
  fs.writeFileSync(
    path.join(srcAboutRoot, 'members.generated.json'),
    `${JSON.stringify({ authLogins, publicLogins, seedLogins, members }, null, 2)}\n`,
  )

  const activeLogins = new Set(members.map((m) => m.login))
  if (fs.existsSync(assetsRoot)) {
    for (const file of fs.readdirSync(assetsRoot)) {
      const match = /^member-(.+)\.png$/.exec(file)
      if (match && !activeLogins.has(match[1])) {
        fs.unlinkSync(path.join(assetsRoot, file))
      }
    }
  }

  for (const { login } of members) {
    await ensureAvatar(login)
  }

  const indexSrc = path.join(srcAboutRoot, 'index.md')
  if (fs.existsSync(indexSrc)) {
    let indexMd = fs.readFileSync(indexSrc, 'utf8')
    indexMd = injectMembers(
      indexMd,
      members.length
        ? buildMembersHtml(members)
        : '<p class="about-section-desc">暂无成员，见 <a href="https://github.com/orgs/Z-TEAM-Z/people" target="_blank" rel="noopener noreferrer">GitHub 组织 People</a>。</p>',
    )
    fs.mkdirSync(aboutPageRoot, { recursive: true })
    fs.writeFileSync(path.join(aboutPageRoot, 'index.md'), indexMd)
  }

  if (fs.existsSync(assetsRoot)) {
    if (fs.existsSync(publicAboutRoot)) {
      fs.rmSync(publicAboutRoot, { recursive: true, force: true })
    }
    copyDir(assetsRoot, publicAboutRoot)
  }

  const source = token && authLogins.length ? 'org API (auth)' : 'org public + members.json'
  console.log(
    `Synced about → website/about/ (${members.length} member(s), ${source}; auth=${authLogins.length}, public=${publicLogins.length}, seed=${seedLogins.length}).`,
  )
}

await main()
