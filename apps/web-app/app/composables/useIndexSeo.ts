export function useIndexSeo(path: string, titleKey: string, descriptionKey: string) {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const canonical = computed(() => `https://kosarev.space${localePath(path)}`)
  const ogImage = computed(() => `https://kosarev.space/og/${locale.value === 'en' ? 'en' : 'ru'}/home.png`)
  useSeoMeta({
    title: () => `${t(titleKey)} — ${t('hero.name')}`,
    description: () => t(descriptionKey),
    ogTitle: () => t(titleKey),
    ogDescription: () => t(descriptionKey),
    ogType: 'website',
    ogUrl: canonical,
    ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterCard: 'summary_large_image',
    twitterImage: ogImage,
  })
  useHead(() => ({
    htmlAttrs: { lang: locale.value },
    link: [
      { rel: 'canonical', href: canonical.value },
      { rel: 'alternate', hreflang: 'ru', href: `https://kosarev.space${path}` },
      { rel: 'alternate', hreflang: 'en', href: `https://kosarev.space/en${path}` },
      { rel: 'alternate', hreflang: 'x-default', href: `https://kosarev.space${path}` },
    ],
  }))
}
