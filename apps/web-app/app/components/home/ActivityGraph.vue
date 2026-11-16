<template>
  <div
    class="activity-graph"
    :style="{ '--weeks': Math.ceil(days.length / 7) }"
    :class="{ 'activity-graph-mini': mini }"
    :aria-label="t('activity.graph')"
    role="group"
  >
    <span
      v-for="(day, index) in days"
      :key="day.date"
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
const activeDay = ref(0)
function moveFocus(event: KeyboardEvent, index: number) {
  const steps: Record<string, number> = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1, Home: -index, End: props.days.length - index - 1 }
  if (!(event.key in steps)) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  activeDay.value = Math.max(0, Math.min(props.days.length - 1, index + steps[event.key]!))
  const parent = (event.target as HTMLElement).parentElement
  ;(parent?.children[activeDay.value] as HTMLElement)?.focus()
}
function label(day: ActivityDay) {
  return `${new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${day.date}T00:00:00Z`))}: ${t('activity.contributionCount', { count: day.count })}`
}
</script>
