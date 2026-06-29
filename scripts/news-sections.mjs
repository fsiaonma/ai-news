/** 资讯日报固定章节顺序 */
export const NEWS_SECTIONS = [
  '模型发布',
  '产品更新',
  '论文与研究',
  '就业趋势',
  '行业动态',
  'AI 热门开源项目',
]

export function renderSections(reportDate, sections, renderItem) {
  const byName = new Map(sections.map((s) => [s.name, s.items]))
  const parts = [
    `# AI 资讯日报：${reportDate}`,
    '',
    `> 截至 ${reportDate}。`,
    '',
  ]

  for (const name of NEWS_SECTIONS) {
    const items = byName.get(name) || []
    parts.push(`## ${name}`, '')
    if (!items.length) {
      parts.push('（本日无新条目）', '')
      continue
    }
    for (const item of items) {
      parts.push(typeof renderItem === 'function' ? renderItem(item) : item)
    }
  }

  return `${parts.join('\n').trimEnd()}\n`
}
