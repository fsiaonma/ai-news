import { defineConfig } from 'vitepress'
import newsSidebar from './sidebar.generated.mjs'
import courseSidebar from './sidebar.course.mjs'

const GITHUB_ORG = 'https://github.com/Z-TEAM-Z'
const GITHUB_REPO = 'https://github.com/Z-TEAM-Z/ai-news'

export default defineConfig({
  title: 'AI-NEWS',
  description: '每日 AI 模型、产品、论文、行业动态 — 联网检索 · 来源核验 · 系统教程',
  lang: 'zh-CN',
  base: '/ai-news/',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',
  head: [['meta', { name: 'theme-color', content: '#000000' }]],
  themeConfig: {
    siteTitle: 'AI-NEWS',
    notFound: {
      title: '页面不存在',
      quote: '该页面不存在或链接已失效。',
      linkLabel: '返回首页',
      linkText: '返回首页',
    },
    nav: [
      { text: '首页', link: '/' },
      { text: 'AI资讯', link: '/news/' },
      { text: 'Agent教程', link: '/course/' },
      { text: '关于我们', link: '/about/' },
    ],
    sidebar: {
      '/news/': newsSidebar,
      '/course/': courseSidebar,
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Z-TEAM-Z/ai-news',
      },
    ],
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 2],
      label: '章节索引',
    },
    footer: {
      message: `由 <a href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">@zteam</a> 制作 · AI News · Agent教程 · <a href="/about/">关于我们</a> · <a href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">关注</a> · <a href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer">Star</a>`,
    },
  },
})
