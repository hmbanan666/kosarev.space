<template>
  <div
    class="activity-graph"
    :style="{ '--weeks': Math.ceil((visibleDays.length + offset) / 7) }"
    :class="{ 'activity-graph-mini': mini }"
    :aria-label="t('activity.graph')"
    role="group"
  >
    <span
      v-for="(day, index) in visibleDays"
      :key="day.date"
      :style="index === 0 && !mini ? { gridRowStart: offset + 1 } : undefined"
      :class="`activity-level-${Math.min(4, day.count)}`"
      :title="mini ? label(day) : undefined"
      :aria-describedby="tip?.date === day.date ? tooltipId : undefined"
      :aria-label="label(day)"
      :tabindex="mini ? undefined : index === activeDay ? 0 : -1"
      role="img"
      @keydown="moveFocus($event, index)"
      @pointerenter="showTip($event, day)"
      @pointerleave="leaveDay($event)"
      @focus="activeDay = index; showTip($event, day)"
      @blur="tip = undefined"
      @click="selectDay($event, day)"
      @keydown.esc.stop.prevent="tip = undefined"
    />
  </div>
  <Teleport to="body">
    <div
      v-if="tip"
      :id="tooltipId"
      class="activity-day-tooltip"
      role="tooltip"
      :style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
    >
      {{ tip.text }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ActivityDay } from '~~/shared/activity'

const props = defineProps<{ days: ActivityDay[], mini?: boolean }>()
const { t, locale } = useI18n()
const mobile = useMediaQuery('(max-width: 767px)')
const mounted = useMounted()
const visibleDays = computed(() => {
  const last = props.days.at(-1)
  if (props.mini || !mounted.value || !mobile.value || !last) {
    return props.days
  }
  const lastWeekLength = new Date(`${last.date}T00:00:00Z`).getUTCDay() + 1
  return props.days.slice(-(25 * 7 + lastWeekLength))
})
const offset = computed(() => props.mini || !visibleDays.value[0] ? 0 : new Date(`${visibleDays.value[0].date}T00:00:00Z`).getUTCDay())
const activeDay = ref(0)
const tooltipId = useId()
const tip = ref<{ date: string, text: string, x: number, y: number }>()
function showTip(event: Event, day: ActivityDay) {
  if (props.mini) {
    return
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tip.value = {
    date: day.date, text: label(day),
    x: Math.max(8, Math.min(window.innerWidth - 268, rect.left + rect.width / 2 - 130)),
    y: rect.top > 72 ? rect.top - 60 : rect.bottom + 8,
  }
}
function leaveDay(event: PointerEvent) {
  if (event.pointerType !== 'touch' && document.activeElement !== event.currentTarget) {
    tip.value = undefined
  }
}
function selectDay(event: MouseEvent, day: ActivityDay) {
  if (!props.mini) {
    event.stopPropagation()
    ;(event.currentTarget as HTMLElement).focus({ preventScroll: true })
    showTip(event, day)
  }
}
// A teleported tip must not linger when the canvas pans or another control opens.
onMounted(() => {
  if (props.mini) {
    return
  }
  useEventListener(window, 'scroll', () => {
    tip.value = undefined
  }, true)
  useEventListener(window, 'resize', () => {
    tip.value = undefined
  })
  useEventListener(document, 'pointerdown', (event) => {
    if (!(event.target as HTMLElement).closest('.activity-graph')) {
      tip.value = undefined
    }
  })
})
watch(visibleDays, () => {
  activeDay.value = 0
  tip.value = undefined
})
function moveFocus(event: KeyboardEvent, index: number) {
  const steps: Record<string, number> = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1, Home: -index, End: visibleDays.value.length - index - 1 }
  if (!(event.key in steps)) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  activeDay.value = Math.max(0, Math.min(visibleDays.value.length - 1, index + steps[event.key]!))
  const parent = (event.target as HTMLElement).parentElement
  ;(parent?.children[activeDay.value] as HTMLElement)?.focus()
}
function label(day: ActivityDay) {
  return `${new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${day.date}T00:00:00Z`))}: ${t('activity.contributionCount', { count: day.count })}`
}
</script>
