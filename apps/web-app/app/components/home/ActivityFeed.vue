<template>
  <ul v-if="items.length" class="activity-feed">
    <li v-for="item in items" :key="item.id">
      <UIcon :name="item.kind === 'commit' ? 'i-lucide-git-commit-horizontal' : item.kind === 'pr' ? 'i-lucide-git-pull-request' : 'i-lucide-tag'" :aria-label="t(`activity.${item.kind}`)" />
      <div>
        <a
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >{{ item.title }}</a>
        <p>{{ item.repo.split('/')[1] }} · <time :datetime="item.date">{{ relativeTime(item.date) }}</time></p>
      </div>
    </li>
  </ul>
  <p v-else class="canvas-footnote">
    {{ t('activity.noActivity') }}
  </p>
</template>

<script setup lang="ts">
import type { ActivityItem } from '~~/shared/activity'

defineProps<{ items: ActivityItem[] }>()
const { t } = useI18n()
const relativeTime = useActivityTime()
</script>
