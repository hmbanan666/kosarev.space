<template>
  <UButton
    :label="otherLocale?.name"
    icon="i-lucide-languages"
    variant="ghost"
    size="sm"
    @click="switchLocale"
  />
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const otherLocale = computed(() => {
  const available = locales.value as Array<{ code: string, name: string }>
  return available.find((l) => l.code !== locale.value) ?? available[0]
})

function switchLocale() {
  if (!otherLocale.value) {
    return
  }
  navigateTo(switchLocalePath(otherLocale.value.code as 'en' | 'ru'))
}
</script>
