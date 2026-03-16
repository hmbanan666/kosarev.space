export default defineAppConfig({
  ui: {
    colors: {
      primary: 'mist',
      secondary: 'zinc',
      neutral: 'zinc',
      error: 'rose',
    },
    input: {
      variants: {
        size: {
          lg: {
            base: 'px-3.5 py-2.5 text-base gap-1.5',
          },
          xl: {
            base: 'px-4 py-3 text-lg gap-2',
          },
        },
      },
    },
    textarea: {
      variants: {
        size: {
          xl: {
            base: 'px-4 py-3 text-lg gap-2',
          },
        },
      },
    },
  },
})
