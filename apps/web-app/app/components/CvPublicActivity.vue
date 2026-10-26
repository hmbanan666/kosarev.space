<template>
  <section class="cv-section" aria-labelledby="cv-independent">
    <h2 id="cv-independent" class="cv-section-title">
      {{ t('cv.independent') }}
    </h2>
    <p class="cv-section-intro">
      {{ t('cv.independentIntro') }}
    </p>
    <dl class="cv-projects">
      <div v-for="project in projects" :key="project.key">
        <dt>
          <a
            :href="project.link"
            target="_blank"
            rel="noopener noreferrer"
          >{{ project.title }}</a>
        </dt>
        <dd>
          <p v-if="project.closedYear" class="cv-project-status">
            {{ project.startedLabel }} · {{ t('projects.closed', { year: project.closedYear }) }}
          </p>
          {{ project.description }}
        </dd>
      </div>
    </dl>
    <div class="cv-public-work">
      <h3>{{ t('cv.publicActivity') }} · {{ t('cv.publicTitle') }}</h3>
      <p class="cv-period" data-cv-fact>
        {{ period }}
      </p>
      <p>{{ t('cv.publicDescription') }}</p>
      <p class="cv-project-status">
        <a
          :href="cvPublicWork.link"
          target="_blank"
          rel="noopener noreferrer"
        >ChatGame</a> · {{ t('projects.closed', { year: closedProjectYears.chatgame }) }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CvProject } from '~/utils/cv'
import { cvPublicWork } from '~/utils/cv'
import { closedProjectYears } from '~/utils/data'

defineProps<{
  projects: CvProject[]
  period: string
}>()

const { t } = useI18n()
</script>
