<template>
  <div class="cv">
    <!-- Header -->
    <header class="cv-header">
      <img
        src="/photo.jpg"
        alt=""
        class="cv-photo"
      >
      <div class="cv-header-info">
        <h1>{{ t('hero.name') }}</h1>
        <div class="cv-meta">
          <p>{{ formattedAge }}, {{ t('cv.birthDate') }}</p>
          <p>{{ t('cv.location') }}</p>
          <p>
            <a href="mailto:nick@kosarev.space">nick@kosarev.space</a>
            <span class="cv-sep">&bull;</span>
            <a href="https://github.com/hmbanan666">github.com/hmbanan666</a>
            <span class="cv-sep">&bull;</span>
            <a href="https://t.me/hmbanan666">t.me/hmbanan666</a>
            <span class="cv-sep">&bull;</span>
            <a href="https://kosarev.space">kosarev.space</a>
          </p>
        </div>
      </div>
    </header>

    <!-- Desired position -->
    <section>
      <h2 class="cv-section-title">
        {{ t('cv.desiredPosition') }}
      </h2>
      <h3 class="cv-desired-role">
        {{ t('cv.desiredRole') }}
      </h3>
      <p class="cv-details">
        {{ t('cv.specializations') }}
      </p>
      <p class="cv-details">
        {{ t('cv.employment') }}
      </p>
      <p class="cv-details">
        {{ t('cv.workFormat') }}
      </p>
    </section>

    <!-- Experience -->
    <section>
      <h2 class="cv-section-title">
        {{ t('cv.totalExperience', { duration: totalDuration }) }}
      </h2>
      <div
        v-for="exp in experiences"
        :key="exp.key"
        class="cv-entry"
      >
        <div class="cv-row">
          <div class="cv-sidebar">
            <span>{{ formatPeriod(exp) }}</span>
            <br>
            <span class="cv-duration">{{ getDuration(exp) }}</span>
          </div>
          <div class="cv-content">
            <h3>{{ getCompanyName(exp) }}</h3>
            <p class="cv-company-location">
              {{ t(`cv.${exp.locationKey}`) }} · {{ t(`cv.${exp.key}.industry`) }}
            </p>
            <p class="cv-role">
              {{ t(`cv.${exp.key}.role`) }}
            </p>
            <p class="cv-description">
              {{ t(`cv.${exp.key}.description`) }}
            </p>
            <ul>
              <li
                v-for="(highlight, j) in getHighlights(`cv.${exp.key}.highlights`)"
                :key="j"
              >
                {{ highlight }}
              </li>
            </ul>
            <p class="cv-stack">
              {{ exp.stack.join(', ') }}
            </p>
            <p v-if="exp.link" class="cv-link">
              <a :href="exp.link">{{ exp.link }}</a>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Public Activity -->
    <section>
      <h2 class="cv-section-title">
        {{ t('cv.publicActivity') }}
      </h2>
      <div
        v-for="act in publicActivities"
        :key="act.key"
        class="cv-entry"
      >
        <div class="cv-row">
          <div class="cv-sidebar">
            <span>{{ formatPeriod(act) }}</span>
            <br>
            <span class="cv-duration">{{ getDuration(act) }}</span>
          </div>
          <div class="cv-content">
            <h3>{{ getCompanyName(act) }}</h3>
            <p class="cv-company-location">
              {{ t(`cv.${act.key}.industry`) }}
            </p>
            <p class="cv-role">
              {{ t(`cv.${act.key}.role`) }}
            </p>
            <p class="cv-description">
              {{ t(`cv.${act.key}.description`) }}
            </p>
            <ul>
              <li
                v-for="(highlight, j) in getHighlights(`cv.${act.key}.highlights`)"
                :key="j"
              >
                {{ highlight }}
              </li>
            </ul>
            <p class="cv-stack">
              {{ act.stack.join(', ') }}
            </p>
            <p v-if="act.link" class="cv-link">
              <a :href="act.link">{{ act.link }}</a>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Education -->
    <section>
      <h2 class="cv-section-title">
        {{ t('cv.education') }}
      </h2>
      <div class="cv-row">
        <div class="cv-sidebar">
          2015
        </div>
        <div class="cv-content">
          <p>{{ t('cv.educationText') }}</p>
        </div>
      </div>
    </section>

    <!-- Courses -->
    <section>
      <h2 class="cv-section-title">
        {{ t('cv.courses') }}
      </h2>
      <div class="cv-row">
        <div class="cv-sidebar">
          {{ t('cv.hexletYear') }}
        </div>
        <div class="cv-content">
          <p>
            <strong>{{ t('cv.hexletName') }}</strong> — {{ t('cv.hexletCourse') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section>
      <h2 class="cv-section-title">
        {{ t('cv.skills') }}
      </h2>
      <div class="cv-row">
        <div class="cv-sidebar" />
        <div class="cv-content">
          <div class="cv-skills">
            <span
              v-for="skill in getHighlights('cv.skillsList')"
              :key="skill"
              class="cv-skill"
            >{{ skill }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Languages -->
    <section>
      <h2 class="cv-section-title">
        {{ t('cv.languages') }}
      </h2>
      <div class="cv-row">
        <div class="cv-sidebar" />
        <div class="cv-content">
          <p v-for="lang in languages" :key="lang.key">
            <strong>{{ t(`cv.${lang.key}`) }}</strong> — {{ lang.level === 'native' ? t('cv.native') : lang.level }}
          </p>
        </div>
      </div>
    </section>

    <!-- About -->
    <section>
      <h2 class="cv-section-title">
        {{ t('cv.about') }}
      </h2>
      <div class="cv-row">
        <div class="cv-sidebar" />
        <div class="cv-content">
          <p>{{ t('cv.aboutText') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  robots: false,
})

const { t, locale, tm, rt } = useI18n()
const { getHighlights } = useHighlights()

const BIRTH_DATE = new Date(1992, 4, 20)
const CAREER_START = 2010

const age = computed(() => {
  const now = new Date()
  let years = now.getFullYear() - BIRTH_DATE.getFullYear()
  const had = now.getMonth() > BIRTH_DATE.getMonth()
    || (now.getMonth() === BIRTH_DATE.getMonth() && now.getDate() >= BIRTH_DATE.getDate())
  if (!had) {
    years--
  }
  return years
})

function pluralRu(n: number, one: string, few: string, many: string) {
  const lastTwo = n % 100
  const lastOne = n % 10
  if (lastTwo >= 11 && lastTwo <= 19) {
    return `${n} ${many}`
  }
  if (lastOne === 1) {
    return `${n} ${one}`
  }
  if (lastOne >= 2 && lastOne <= 4) {
    return `${n} ${few}`
  }
  return `${n} ${many}`
}

const formattedAge = computed(() => {
  const n = age.value
  if (locale.value === 'ru') {
    return pluralRu(n, 'год', 'года', 'лет')
  }
  return `${n} years old`
})

function getCompanyName(entry: { company: string, nameKey?: string }) {
  return entry.nameKey ? t(entry.nameKey) : entry.company
}

function getMonthName(month: number): string {
  const months = tm('cv.months') as unknown[]
  return rt(months[month] as Parameters<typeof rt>[0])
}

function formatPeriod(exp: { startYear: number, startMonth: number, endYear?: number, endMonth?: number, present?: boolean }) {
  const start = `${getMonthName(exp.startMonth)} ${exp.startYear}`
  if (exp.present) {
    return `${start} —\n${t('cv.present')}`
  }
  const end = `${getMonthName(exp.endMonth!)} ${exp.endYear}`
  return `${start} —\n${end}`
}

function calcMonths(startYear: number, startMonth: number, endYear: number, endMonth: number) {
  return (endYear - startYear) * 12 + (endMonth - startMonth)
}

function formatDuration(totalMonths: number, lang: string) {
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  const parts: string[] = []

  if (lang === 'ru') {
    if (years > 0) {
      parts.push(pluralRu(years, 'год', 'года', 'лет'))
    }
    if (months > 0) {
      parts.push(pluralRu(months, 'месяц', 'месяца', 'месяцев'))
    }
  } else {
    if (years > 0) {
      parts.push(`${years} yr${years > 1 ? 's' : ''}`)
    }
    if (months > 0) {
      parts.push(`${months} mo`)
    }
  }

  return parts.join(' ') || (lang === 'ru' ? '< 1 месяца' : '< 1 mo')
}

const totalDuration = computed(() => {
  const now = new Date()
  const months = calcMonths(CAREER_START, 5, now.getFullYear(), now.getMonth() + 1)
  return formatDuration(months, locale.value)
})

function getDuration(exp: { startYear: number, startMonth: number, endYear?: number, endMonth?: number, present?: boolean }) {
  const now = new Date()
  const endYear = exp.present ? now.getFullYear() : (exp.endYear ?? exp.startYear)
  const endMonth = exp.present ? now.getMonth() + 1 : (exp.endMonth ?? exp.startMonth)
  const months = calcMonths(exp.startYear, exp.startMonth, endYear, endMonth)
  return formatDuration(months, locale.value)
}
</script>

<style>
@page {
  size: A4;
  margin: 8mm 10mm;
}

html, body {
  background: white !important;
  color: #333 !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>

<style scoped>
.cv {
  max-width: 210mm;
  margin: 0 auto;
  padding: 12px 16px;
  background: white;
  color: #333;
  font-family: 'Noto Sans', 'Segoe UI', Arial, sans-serif;
  font-size: 9.5pt;
  line-height: 1.6;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.cv :deep(a) {
  color: #0066cc;
  text-decoration: none;
}

/* Header */
.cv-header {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 0;
}

.cv-photo {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.cv-header-info h1 {
  font-size: 26pt;
  font-weight: 700;
  color: #000;
  line-height: 1.15;
  margin-bottom: 6px;
}

.cv-meta {
  font-size: 9pt;
  color: #666;
  line-height: 1.8;
}

.cv-sep {
  margin: 0 4px;
  color: #ccc;
}

/* Sections */
.cv-section-title {
  font-size: 10pt;
  font-weight: 400;
  color: #999;
  border-bottom: 1.5px solid #e0e0e0;
  padding-bottom: 3px;
  margin-bottom: 8px;
  margin-top: 12px;
}

.cv-row {
  display: flex;
  gap: 20px;
}

.cv-sidebar {
  flex-shrink: 0;
  width: 110px;
  font-size: 8.5pt;
  color: #999;
  padding-top: 2px;
  line-height: 1.4;
}

.cv-duration {
  font-size: 8pt;
  color: #bbb;
}

.cv-content {
  flex: 1;
  min-width: 0;
}

/* Entries */
.cv-entry {
  margin-bottom: 12px;
  page-break-inside: avoid;
}

.cv-content h3 {
  font-size: 13pt;
  font-weight: 700;
  color: #000;
  line-height: 1.3;
  margin-bottom: 0;
}

.cv-company-location {
  font-size: 8.5pt;
  color: #999;
  margin-bottom: 4px;
}

.cv-role {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.cv-description {
  font-size: 9.5pt;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.55;
}

.cv-content ul {
  margin: 6px 0 10px 0;
  padding: 0;
  list-style: none;
}

.cv-content li {
  margin-bottom: 3px;
  color: #444;
  font-size: 9pt;
  padding-left: 16px;
  position: relative;
  line-height: 1.55;
}

.cv-content li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: #bbb;
}

.cv-stack {
  font-size: 8.5pt;
  color: #888;
  margin-top: 6px;
}

.cv-link {
  font-size: 8.5pt;
  margin-top: 3px;
}

/* Desired position */
.cv-desired-role {
  font-size: 13pt;
  font-weight: 700;
  color: #000;
  line-height: 1.3;
  margin-bottom: 4px;
}

.cv-details {
  font-size: 9pt;
  color: #555;
  margin-bottom: 1px;
}

/* Skills */
.cv-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.cv-skill {
  display: inline-block;
  background: #f0f0f0;
  color: #333;
  font-size: 8.5pt;
  padding: 2px 8px;
  border-radius: 3px;
}
</style>
