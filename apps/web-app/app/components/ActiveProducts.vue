<template>
  <section class="active-products" aria-labelledby="active-products-title">
    <h2 id="active-products-title" class="active-heading">
      {{ t('projects.activeTitle') }}
    </h2>
    <div class="active-list">
      <article
        v-for="product in activeProducts"
        :id="`project-${product.key}`"
        :key="product.key"
        :data-active-product="product.key"
        class="active-product"
      >
        <h3 class="active-title">
          <NuxtLink v-if="product.page" :to="localePath(product.page)">
            {{ product.title }}<SiteLinkIcon />
          </NuxtLink>
          <template v-else>
            {{ product.title }}
          </template>
        </h3>
        <p class="active-kind">
          {{ t(`projects.${product.key}.kind`) }}
        </p>
        <p class="active-description">
          {{ t(`projects.${product.key}.description`) }}
        </p>
        <p class="active-work">
          {{ t(`projects.${product.key}.work`) }}
        </p>
        <div class="active-links">
          <a
            v-if="product.link"
            :href="product.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t(`projects.${product.key}.visit`) }}<SiteLinkIcon external />
          </a>
          <a
            v-if="product.source"
            :href="product.source"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('site.source') }}<SiteLinkIcon external />
          </a>
          <WritingRelatedPublications kind="project" :work-key="product.key" />
        </div>
        <figure v-if="product.image" class="active-figure">
          <div class="active-image-wrap">
            <img
              :src="product.image"
              :alt="t(`projects.${product.key}.imageAlt`)"
              :width="product.width"
              :height="product.height"
              loading="lazy"
              class="active-image"
            >
          </div>
          <figcaption class="active-caption">
            {{ t(`projects.${product.key}.caption`) }}
            <template v-if="product.key === 'k39'">
              · © <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >OpenStreetMap contributors</a>
              · © <a
                href="https://protomaps.com"
                target="_blank"
                rel="noopener noreferrer"
              >Protomaps</a>
            </template>
          </figcaption>
        </figure>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.active-heading { margin-bottom: 1.25rem; }
.active-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2rem; }
.active-product { min-width: 0; scroll-margin-top: 6rem; padding-top: 1rem; border-top: 1px solid var(--ui-border-accented); }
.active-figure { margin: 1.25rem 0 0; }
.active-image-wrap { padding: .75rem; background: #242019; border: 1px solid #51432c; }
.active-image { width: 100%; height: 13rem; object-fit: contain; }
.active-caption { font-size: .75rem; line-height: 1.5; color: var(--ui-text-muted); margin-top: .5rem; }
.active-caption a { text-decoration: underline; }
.active-title { margin: 0; font: 500 1.65rem/1.25 var(--font-serif); }
.active-title a:hover, .active-title a:focus-visible { color: var(--ui-primary); text-decoration: underline; }
.active-kind { margin-top: .35rem !important; color: var(--ui-primary); font-size: .875rem; }
.active-description, .active-work { margin-top: .75rem !important; max-width: 65ch; font-size: .95rem; }
.active-work { color: var(--ui-text-muted); }
.active-links { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; margin-top: 1rem; font-size: .875rem; }
.active-links a { display: inline-flex; align-items: center; gap: .4rem; color: var(--ui-primary); text-decoration: underline; }
@media (max-width: 850px) { .active-list { grid-template-columns: 1fr; gap: 2rem; } }
</style>
