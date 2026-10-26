<template>
  <button
    v-if="available"
    class="site-presence-control"
    type="button"
    :aria-label="`${t('site.cursors')}. ${status}. ${enabled ? t('site.cursorsOff') : t('site.cursorsOn')}`"
    :aria-pressed="enabled"
    :title="`${status}. ${enabled ? t('site.cursorsOff') : t('site.cursorsOn')}`"
    @click="toggle"
  >
    <UIcon name="i-lucide-mouse-pointer-2" aria-hidden="true" />
    <span v-if="enabled && connected && count > 0" aria-hidden="true">{{ count }}</span>
    <span
      class="sr-only"
      role="status"
      aria-live="polite"
    >{{ status }}</span>
  </button>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { enabled, available, connected, count, toggle } = usePortfolioPresence()
const status = computed(() => !enabled.value ? t('site.cursorsDisabled') : connected.value && count.value > 0 ? t('site.cursorsConnected', { count: count.value }) : t('site.cursorsConnecting'))
</script>
