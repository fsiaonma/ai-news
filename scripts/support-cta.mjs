export const GITHUB_ORG = 'https://github.com/Z-TEAM-Z'
export const GITHUB_REPO = 'https://github.com/Z-TEAM-Z/ai-news'

export function supportCtaTopHtml() {
  return `<div class="site-top-cta">
<div class="site-top-cta-inner home-cta home-cta--hero">
<p class="home-cta-text">日报与 Agent 教程持续更新。有帮助欢迎关注 <a href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">@zteam</a>，或 Star 本项目以便追踪更新。</p>
<div class="home-cta-actions">
<a class="home-btn home-btn--primary home-btn--sm" href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">关注 @zteam</a>
<a class="home-btn home-btn--outline home-btn--sm" href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer">Star 本项目</a>
</div>
</div>
</div>`
}

export function supportCtaHeroHtml() {
  return `<div class="home-cta home-cta--hero">
<p class="home-cta-text">日报与 Agent 教程持续更新。有帮助欢迎关注 <a href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">@zteam</a>，或 Star 本项目以便追踪更新。</p>
<div class="home-cta-actions">
<a class="home-btn home-btn--primary home-btn--sm" href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">关注 @zteam</a>
<a class="home-btn home-btn--outline home-btn--sm" href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer">Star 本项目</a>
</div>
</div>`
}

export function supportCtaHtml() {
  return supportCtaHeroHtml()
}

export function supportCtaCompactHtml() {
  return `<div class="site-support site-support--compact">
<p class="site-support-text">觉得有用？欢迎关注 <a href="${GITHUB_ORG}" target="_blank" rel="noopener noreferrer">@zteam</a>，并在 GitHub <a href="${GITHUB_REPO}" target="_blank" rel="noopener noreferrer">Star 本项目</a>，获取最新资讯与教程更新。</p>
</div>`
}
