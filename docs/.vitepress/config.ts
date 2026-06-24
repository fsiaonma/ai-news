import { defineConfig } from 'vitepress'
import sidebar from './sidebar.generated.mjs'

export default defineConfig({
  title: 'AI 资讯日报',
  description: '每日 AI 模型、产品、论文、行业动态与开源项目摘要',
  lang: 'zh-CN',
  base: '/ai-news/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '归档', link: '/news/' },
    ],
    sidebar,
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Z-TEAM-Z/ai-news',
      },
    ],
    search: {
      provider: 'local',
    },
    footer: {
      message: '内容由 ai-info-research 检索生成，请结合原文链接核验。',
      copyright: 'Copyright © AI News',
    },
  },
})
