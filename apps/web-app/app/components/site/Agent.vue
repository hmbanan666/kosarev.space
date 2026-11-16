<template>
  <dialog
    ref="dialog"
    class="site-agent ym-hide-content ym-disable-clickmap"
    aria-labelledby="site-agent-title"
    @cancel.prevent="close"
    @click="outside"
    @keydown.tab="trapFocus"
  >
    <div class="agent-shell">
      <header class="agent-header">
        <h2 id="site-agent-title">
          <UIcon name="i-lucide-bot" aria-hidden="true" />{{ t('agent.label') }}
        </h2>
        <div class="agent-actions">
          <button
            :disabled="!messages.length"
            :aria-label="t('agent.clear')"
            :title="t('agent.clear')"
            @click="clear"
          >
            <UIcon name="i-lucide-trash-2" />
          </button>
          <button
            :aria-label="t('agent.close')"
            :title="t('agent.close')"
            @click="close"
          >
            <UIcon name="i-lucide-x" />
          </button>
        </div>
      </header>
      <div
        ref="scroll"
        class="agent-scroll"
        @scroll="trackScroll"
      >
        <div v-if="!messages.length" class="agent-empty">
          <span class="agent-mark" aria-hidden="true"><UIcon name="i-lucide-bot" /></span>
          <p class="agent-intro">
            {{ t('agent.intro') }}
          </p>
          <div class="agent-suggestions" :aria-label="t('agent.suggestions')">
            <button
              v-for="question in suggestions"
              :key="question"
              @click="submit(question)"
            >
              {{ question }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
            </button>
          </div>
        </div>
        <ol
          v-else
          class="agent-messages"
          :aria-label="t('agent.history')"
        >
          <li
            v-for="(message, index) in messages"
            :key="index"
            :class="`agent-message agent-${message.role}`"
          >
            <p class="agent-role">
              {{ t(message.role === 'user' ? 'agent.you' : 'agent.label') }}
            </p>
            <p v-if="message.role === 'user'" class="agent-question">
              {{ message.content }}
            </p>
            <!-- HTML and images are disabled; markdown-it rejects unsafe link protocols. -->
            <div
              v-else-if="message.content"
              class="agent-markdown"
              v-html="markdown.render(message.content)"
            />
            <p
              v-if="message.status && message.status !== 'streaming'"
              class="agent-notice"
              role="status"
            >
              {{ t(`agent.${message.status}`) }} <NuxtLink
                v-if="message.status === 'offline'"
                :to="localePath('/contact')"
                @click="close"
              >
                {{ t('agent.contact') }}
              </NuxtLink>
            </p>
            <p v-if="message.status === 'streaming' && !message.content" class="agent-thinking">
              {{ t('agent.thinking') }}
            </p>
            <details v-if="message.sources?.length" class="agent-sources">
              <summary>{{ t('agent.sources') }} <span>{{ message.sources.length }}</span></summary>
              <ul>
                <li v-for="source in message.sources" :key="source.url">
                  <NuxtLink
                    :to="source.url"
                    :external="source.url === '/pro.json'"
                    @click="close"
                  >
                    {{ source.title }}
                  </NuxtLink>
                </li>
              </ul>
            </details>
          </li>
        </ol>
      </div>
      <form class="agent-composer ym-disable-submit" @submit.prevent="submit(input)">
        <label class="sr-only" for="site-agent-input">{{ t('agent.placeholder') }}</label>
        <textarea
          id="site-agent-input"
          ref="textarea"
          v-model="input"
          class="ym-disable-keys"
          :placeholder="t('agent.placeholder')"
          maxlength="600"
          rows="2"
          @keydown.enter.exact="enter"
        />
        <div class="agent-composer-bottom">
          <span class="agent-hint">{{ t('agent.hint') }}</span>
          <button
            v-if="busy"
            type="button"
            class="agent-send"
            :aria-label="t('agent.stop')"
            @click="stop"
          >
            <UIcon name="i-lucide-square" />{{ t('agent.stop') }}
          </button>
          <button
            type="submit"
            class="agent-send"
            :disabled="!input.trim() || input.trim().length > 600"
            :aria-label="t('agent.send')"
          >
            <UIcon name="i-lucide-arrow-up" />{{ t('agent.send') }}
          </button>
        </div>
        <p class="agent-privacy">
          {{ t('agent.privacy') }}
        </p>
      </form>
      <p
        class="sr-only"
        role="status"
        aria-live="polite"
      >
        {{ busy ? t('agent.thinking') : messages.length ? t('agent.finished') : '' }}
      </p>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({ html: false, linkify: false }).disable('image')
markdown.renderer.rules.link_open = (tokens, index, options, _env, renderer) => {
  tokens[index]!.attrJoin('class', 'ym-disable-tracklink')
  return renderer.renderToken(tokens, index, options)
}
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { open, messages, busy, send, stop, clear } = useAgentConversation()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const scroll = useTemplateRef<HTMLDivElement>('scroll')
const input = ref('')
let pinned = true
let returnFocus: HTMLElement | null = null
const project = computed(() => {
  const key = route.path.match(/\/projects\/([\w-]+)/)?.[1]
  return ({ k39: 'K39', context: 'Context', dostigus: 'Dostigus', woodlands: 'Woodlands' } as Record<string, string>)[key ?? '']
})
const suggestions = computed(() => project.value
  ? ['what', 'features', 'stack', 'status', 'link'].map((key) => t(`agent.project.${key}`, { name: project.value }))
  : ['now', 'agents', 'stack', 'fit', 'contact'].map((key) => t(`agent.questions.${key}`)))
function trapFocus(event: KeyboardEvent) {
  const controls = [...(dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], textarea, summary, [tabindex="0"]') ?? [])].filter((element) => element.getClientRects().length)
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
function close() {
  open.value = false
}
function outside(event: MouseEvent) {
  if (dialog.value && event.target === dialog.value) {
    const rect = dialog.value.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      close()
    }
  }
}
function trackScroll() {
  const element = scroll.value
  pinned = !element || element.scrollHeight - element.scrollTop - element.clientHeight < 80
}
function submit(question: string) {
  if (!question.trim() || question.trim().length > 600) {
    return
  }
  input.value = ''
  pinned = true
  void send(question, route.path, locale.value)
  textarea.value?.focus()
}
function enter(event: KeyboardEvent) {
  if (!event.isComposing) {
    event.preventDefault()
    submit(input.value)
  }
}
function shortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (event.defaultPrevented || event.isComposing || (event.key === '/' && target.closest('input, textarea, select, [contenteditable="true"]'))) {
    return
  }
  if ((event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) || (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))) {
    event.preventDefault()
    open.value = true
  }
}
watch(open, async (value) => {
  if (value) {
    returnFocus = document.activeElement as HTMLElement
    dialog.value?.showModal()
    await nextTick()
    textarea.value?.focus()
  } else {
    dialog.value?.close()
    await nextTick()
    returnFocus?.focus()
  }
})
watch(() => messages.value.map((message) => `${message.content}${message.status}`).join(''), async () => {
  await nextTick()
  if (pinned && scroll.value) {
    scroll.value.scrollTop = scroll.value.scrollHeight
  }
})
onMounted(() => document.addEventListener('keydown', shortcut))
onBeforeUnmount(() => document.removeEventListener('keydown', shortcut))
</script>

<style scoped>
.site-agent { position: fixed; inset: 0 0 0 auto; margin: 0; width: min(460px, 100vw); height: 100dvh; max-width: 100vw; max-height: 100dvh; padding: 0; background: #10100f; color: #f3f1eb; border: 0; border-left: 1px solid #625039; box-shadow: -24px 0 80px #0005; }
.site-agent::backdrop { background: #0003; }
.agent-shell { height: 100%; display: flex; flex-direction: column; font-size: 14px; line-height: 1.65; }
.agent-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #353535; }
.agent-header h2 { display: flex; gap: 10px; align-items: center; margin: 0; font-size: 17px; font-weight: 600; }
.agent-header h2 .iconify { color: #d9ad67; }
.agent-actions { display: flex; gap: 4px; }
.agent-actions button { width: 40px; height: 40px; display: grid; place-items: center; color: #aaa8a2; }
button { cursor: pointer; }
button:disabled { opacity: .35; cursor: default; }
button:focus-visible, textarea:focus-visible, a:focus-visible, summary:focus-visible { outline: 2px solid #d9ad67; outline-offset: 3px; }
.agent-scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 28px 24px; }
.agent-empty { padding-top: clamp(16px, 7vh, 64px); }
.agent-mark { display: grid; place-items: center; width: 48px; height: 48px; border: 1px solid #625039; color: #d9ad67; font-size: 25px; margin-bottom: 24px; }
.agent-intro { color: #c7c5bf; margin-bottom: 30px; font-size: 15px; }
.agent-suggestions { display: flex; flex-wrap: wrap; gap: 10px; }
.agent-suggestions button { display: flex; align-items: center; gap: 12px; min-height: 44px; border: 1px solid #353535; padding: 10px 12px; text-align: left; font-size: 13px; }
.agent-suggestions button .iconify { color: #d9ad67; flex-shrink: 0; }
.agent-suggestions button:hover { border-color: #d9ad67; background: #d9ad6708; }
.agent-messages { list-style: none; padding: 0; margin: 0; }
.agent-message + .agent-message { margin-top: 26px; }
.agent-role { font-size: 11px; font-family: var(--font-mono); color: #aaa8a2; margin-bottom: 9px; }
.agent-assistant .agent-role { color: #d9ad67; }
.agent-question { padding: 12px 14px; border-left: 2px solid #625039; background: #1a1917; white-space: pre-wrap; overflow-wrap: anywhere; }
.agent-markdown { overflow-wrap: anywhere; }
.agent-markdown :deep(p), .agent-markdown :deep(ul), .agent-markdown :deep(ol) { margin: 0 0 14px; }
.agent-markdown :deep(ul), .agent-markdown :deep(ol) { padding-left: 20px; }
.agent-markdown :deep(ul) { list-style: disc; }
.agent-markdown :deep(ol) { list-style: decimal; }
.agent-markdown :deep(a), .agent-sources a, .agent-notice a { color: #d9ad67; text-decoration: underline; text-underline-offset: 3px; }
.agent-markdown :deep(pre) { overflow-x: auto; padding: 12px; background: #080808; }
.agent-markdown :deep(h1), .agent-markdown :deep(h2), .agent-markdown :deep(h3) { font-size: 16px; margin: 18px 0 10px; }
.agent-markdown :deep(table) { display: block; overflow-x: auto; }
.agent-notice { border: 1px solid #625039; padding: 12px; color: #c7c5bf; }
.agent-thinking { color: #aaa8a2; }
.agent-sources { border-top: 1px solid #353535; margin-top: 18px; padding-top: 10px; font-size: 12px; color: #aaa8a2; }
.agent-sources summary { cursor: pointer; }
.agent-sources summary span { margin-left: 6px; color: #d9ad67; }
.agent-sources ul { list-style: none; padding: 10px 0 0; }
.agent-sources li + li { margin-top: 6px; }
.agent-composer { border-top: 1px solid #353535; padding: 18px 24px max(20px, env(safe-area-inset-bottom)); background: #151515; }
.agent-composer textarea { display: block; width: 100%; resize: none; background: transparent; color: #f3f1eb; padding: 8px 0; min-height: 70px; font: inherit; }
.agent-composer textarea::placeholder { color: #aaa8a2; }
.agent-composer-bottom { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-top: 12px; }
.agent-hint { flex: 1; font-size: 11px; color: #aaa8a2; }
.agent-send { flex-shrink: 0; display: flex; align-items: center; gap: 7px; min-height: 40px; padding: 8px 12px; border: 1px solid #625039; color: #d9ad67; }
@media (max-width: 767px) {
  .site-agent { inset: auto 0 0; width: 100%; border-left: 0; border-top: 1px solid #625039; }
  .agent-header { padding: 12px 20px; }
  .agent-scroll { padding: 24px 20px; }
  .agent-composer { padding-left: 20px; padding-right: 20px; }
  .agent-composer textarea { font-size: 16px; }
  .agent-empty { padding-top: 20px; }
}
.agent-privacy { margin-top: 12px; font-size: 11px; color: #aaa8a2; }
@media (any-pointer: coarse), (hover: none) { .agent-hint { display: none; } }
@media print { .site-agent { display: none; } }
</style>
