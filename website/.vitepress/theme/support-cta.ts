import { h, type VNode } from 'vue'

export const GITHUB_ORG = 'https://github.com/Z-TEAM-Z'
export const GITHUB_REPO = 'https://github.com/Z-TEAM-Z/ai-news'

const linkProps = { target: '_blank', rel: 'noopener noreferrer' }

export function supportCtaHtml(compact = false): string {
  if (compact) {
    return `<div class="site-support site-support--compact">
<p class="site-support-text">觉得有用？欢迎关注 <a href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">@zteam</a>，并在 GitHub <a href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer">Star 本项目</a>，获取最新资讯与教程更新。</p>
</div>`
  }
  return `<section class="home-cta">
<p class="home-cta-text">日报与 Agent 教程持续更新中。如果对你有帮助，欢迎关注 <a href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">@zteam</a>，并为项目点亮 Star，方便追踪后续内容。</p>
<div class="home-cta-actions">
<a class="home-btn home-btn--primary" href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">关注 @zteam</a>
<a class="home-btn home-btn--ghost" href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer">Star 本项目</a>
</div>
</section>`
}

export function SupportTopBar(): VNode {
  return h('div', { class: 'site-top-cta' }, [
    h('div', { class: 'site-top-cta-inner home-cta home-cta--hero' }, [
      h('p', { class: 'home-cta-text' }, [
        '日报与 Agent 教程持续更新。有帮助欢迎关注 ',
        h('a', { href: GITHUB_ORG, ...linkProps }, '@zteam'),
        '，或 Star 本项目以便追踪更新。',
      ]),
      h('div', { class: 'home-cta-actions' }, [
        h(
          'a',
          { class: 'home-btn home-btn--primary home-btn--sm', href: GITHUB_ORG, ...linkProps },
          '关注 @zteam',
        ),
        h(
          'a',
          { class: 'home-btn home-btn--outline home-btn--sm', href: GITHUB_REPO, ...linkProps },
          'Star 本项目',
        ),
      ]),
    ]),
  ])
}

export function SupportCta(compact = false): VNode {
  if (compact) {
    return h('div', { class: 'site-support site-support--compact' }, [
      h('p', { class: 'site-support-text' }, [
        '觉得有用？欢迎关注 ',
        h('a', { href: GITHUB_ORG, ...linkProps }, '@zteam'),
        '，并在 GitHub ',
        h('a', { href: GITHUB_REPO, ...linkProps }, 'Star 本项目'),
        '，获取最新资讯与教程更新。',
      ]),
    ])
  }
  return h('section', { class: 'home-cta' }, [
    h('p', { class: 'home-cta-text' }, [
      '日报与 Agent 教程持续更新中。如果对你有帮助，欢迎关注 ',
      h('a', { href: GITHUB_ORG, ...linkProps }, '@zteam'),
      '，并为项目点亮 Star，方便追踪后续内容。',
    ]),
    h('div', { class: 'home-cta-actions' }, [
      h(
        'a',
        { class: 'home-btn home-btn--primary', href: GITHUB_ORG, ...linkProps },
        '关注 @zteam',
      ),
      h(
        'a',
        { class: 'home-btn home-btn--ghost', href: GITHUB_REPO, ...linkProps },
        'Star 本项目',
      ),
    ]),
  ])
}
