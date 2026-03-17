<template>
  <UButton
    :label="nextLocale.name"
    icon="i-lucide-languages"
    variant="ghost"
    size="sm"
    @click="switchLocale"
  />
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed(() => {
  return locales.value as Array<{ code: string, name: string }>
})

const nextLocale = computed(() => {
  const all = availableLocales.value
  const currentIndex = all.findIndex((l) => l.code === locale.value)
  return all[(currentIndex + 1) % all.length]!
})

function switchLocale() {
  navigateTo(switchLocalePath(nextLocale.value.code as 'en' | 'ru'))
}
</script>
