<template>
  <article
    id="cv-content"
    class="cv-document"
    :class="{ 'cv-document-print': printable }"
    :lang="cvLocale"
    :data-cv-ready="cvLocale"
    data-cv-document
    aria-labelledby="cv-name"
    tabindex="-1"
  >
    <div class="cv-sheet">
      <CvHeader />
      <CvExperience
        id="cv-experience"
        :title="t('cv.experience')"
        :entries="entries.slice(0, 2)"
      />
      <section class="cv-skills" aria-labelledby="cv-skills">
        <h2 id="cv-skills" class="cv-section-title">
          {{ t('cv.skills') }}
        </h2>
        <dl>
          <div v-for="group in cvSkillGroups" :key="group.key">
            <dt>{{ t(`cv.${group.key}`) }}</dt>
            <dd>{{ group.skills.join(', ') }}</dd>
          </div>
        </dl>
      </section>
    </div>
    <div class="cv-sheet cv-sheet-secondary">
      <p class="cv-print-continuation" aria-hidden="true">
        {{ t('hero.name') }} · {{ t('cv.subtitle') }}
      </p>
      <CvExperience
        id="cv-earlier"
        :title="t('cv.earlierExperience')"
        :entries="entries.slice(2)"
      />
      <CvPublicActivity :projects="selectedProjects" :period="publicPeriod" />
      <div class="cv-background">
        <section class="cv-section" aria-labelledby="cv-education">
          <h2 id="cv-education" class="cv-section-title">
            {{ t('cv.education') }}
          </h2>
          <h3>{{ t('cv.educationTitle') }}</h3>
          <p>{{ t('cv.educationText') }}</p>
          <p>{{ t('cv.course') }}</p>
        </section>
        <section class="cv-section" aria-labelledby="cv-languages">
          <h2 id="cv-languages" class="cv-section-title">
            {{ t('cv.languages') }}
          </h2>
          <p>{{ t('cv.languageText') }}</p>
        </section>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { cvSkillGroups } from '~/utils/cv'

defineProps<{ printable?: boolean }>()

const { t } = useI18n()
const { entries, selectedProjects, publicPeriod, cvLocale } = useCv()
</script>

<style src="~/assets/css/cv.css"></style>
