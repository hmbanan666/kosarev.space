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
      :title="label(day)"
      :aria-label="label(day)"
      :tabindex="mini ? undefined : index === activeDay ? 0 : -1"
      role="img"
      @keydown="moveFocus($event, index)"
    />
  </div>
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
watch(visibleDays, () => {
  activeDay.value = 0
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
