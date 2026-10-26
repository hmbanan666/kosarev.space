<template>
  <div class="contact-paths">
    <div class="contact-email-row">
      <a class="contact-email" :href="`mailto:${email}`">{{ email }}</a>
      <button
        type="button"
        :disabled="!mounted"
        class="site-icon-button"
        :aria-label="t('site.copyEmail')"
        @click="copyEmail"
      >
        <UIcon name="i-lucide-copy" aria-hidden="true" />
      </button>
    </div>
    <p
      class="contact-feedback"
      role="status"
      aria-live="polite"
    >
      {{ feedback ? t(`site.${feedback}`) : '' }}
    </p>
    <label v-if="feedback === 'copyManually'" class="contact-manual">
      {{ t('site.emailAddress') }}
      <input
        ref="emailInput"
        :value="email"
        readonly
        @focus="($event.target as HTMLInputElement).select()"
      >
    </label>
    <div class="contact-other">
      <a
        href="https://t.me/hmbanan666"
        target="_blank"
        rel="noopener noreferrer"
      >Telegram <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" /></a>
      <a
        href="https://github.com/hmbanan666"
        target="_blank"
        rel="noopener noreferrer"
      >GitHub <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" /></a>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const email = 'nick@kosarev.space'
const mounted = useMounted()
const feedback = shallowRef<'emailCopied' | 'copyManually' | ''>('')
const emailInput = useTemplateRef<HTMLInputElement>('emailInput')
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email)
    feedback.value = 'emailCopied'
  } catch {
    feedback.value = 'copyManually'
    await nextTick()
    emailInput.value?.focus()
    emailInput.value?.select()
  }
}
</script>
