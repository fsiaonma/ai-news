import { defineComponent, h } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { SupportTopBar } from './support-cta'
import './custom.css'

const Layout = defineComponent({
  setup(_props, { slots }) {
    const route = useRoute()
    const layoutClass = [
      'site-top-bar-layout',
      route.path.includes('/course') ? 'course-layout' : '',
      route.path.includes('/about') ? 'about-layout' : '',
    ]
      .filter(Boolean)
      .join(' ')
    return () =>
      h(
        DefaultTheme.Layout,
        {
          class: layoutClass,
        },
        {
          ...slots,
          'layout-top': () => h(SupportTopBar),
        },
      )
  },
})

export default {
  extends: DefaultTheme,
  Layout,
}
