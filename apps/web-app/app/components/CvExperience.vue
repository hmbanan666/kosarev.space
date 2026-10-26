<template>
  <section :aria-labelledby="id" class="cv-section">
    <h2 :id="id" class="cv-section-title">
      {{ title }}
    </h2>
    <article
      v-for="entry in entries"
      :key="entry.key"
      class="cv-entry"
      :data-cv-entry="entry.key"
    >
      <div class="cv-entry-heading">
        <div>
          <h3>
            <a
              v-if="entry.link"
              :href="entry.link"
              target="_blank"
              rel="noopener noreferrer"
            >{{ entry.company }}</a>
            <template v-else>
              {{ entry.company }}
            </template>
          </h3>
          <p class="cv-role" data-cv-fact>
            {{ entry.role }}
          </p>
        </div>
        <p class="cv-period" data-cv-fact>
          <time :datetime="entry.period.start">{{ entry.startLabel }}</time> - <time :datetime="entry.period.end">{{ entry.endLabel }}</time>
          <span v-if="entry.durationLabel" class="cv-duration">{{ entry.durationLabel }}</span>
        </p>
      </div>
      <p class="cv-entry-summary">
        {{ entry.summary }}
      </p>
      <ul class="cv-highlights">
        <li v-for="highlight in entry.highlights" :key="highlight">
          {{ highlight }}
        </li>
      </ul>
      <p class="cv-stack">
        {{ entry.stack.join(' · ') }}
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { CvEntry } from '~/utils/cv'

defineProps<{
  id: string
  title: string
  entries: CvEntry[]
}>()
</script>
