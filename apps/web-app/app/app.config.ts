export default defineAppConfig({
  ui: {
    colors: {
      primary: 'mist',
      secondary: 'zinc',
      neutral: 'zinc',
      error: 'rose',
    },
    pageHero: {
      variants: {
        orientation: {
          horizontal: {
            container: 'lg:grid-cols-[3fr_2fr]',
          },
        },
      },
      slots: {
        container: 'py-16 sm:py-20 lg:py-24 gap-8 sm:gap-y-12',
      },
    },
    pageSection: {
      slots: {
        container: 'py-8 sm:py-12 lg:py-16 gap-6 sm:gap-8',
      },
    },
  },
})
