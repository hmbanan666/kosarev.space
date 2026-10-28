<template>
  <section class="active-products" aria-labelledby="active-products-title">
    <h3 id="active-products-title" class="active-heading">
      {{ t('projects.activeTitle') }}
    </h3>
    <div class="active-list">
      <article
        v-for="product in activeProducts"
        :id="`project-${product.key}`"
        :key="product.key"
        :data-active-product="product.key"
        class="active-product"
      >
        <figure class="active-figure">
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
        <h4 class="active-title">
          {{ product.title }}
        </h4>
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
            :href="product.link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t(`projects.${product.key}.visit`) }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </a>
          <a
            v-if="product.source"
            :href="product.source"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('site.source') }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </a>
          <WritingRelatedPublications kind="project" :work-key="product.key" />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>

<style scoped>
.active-heading { margin-bottom: 1.25rem; }
.active-list { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
.active-product { min-width: 0; scroll-margin-top: 6rem; }
.active-figure { margin: 0 0 1.25rem; }
.active-image-wrap { height: 19rem; padding: 1rem; background: #242019; border: 1px solid #51432C; border-radius: .5rem; }
.active-image { width: 100%; height: 100%; object-fit: contain; }
.active-caption { font-size: .7rem; line-height: 1.5; color: var(--ui-text-muted); margin-top: .5rem; }
.active-caption a { text-decoration: underline; }
.active-title { margin: 0; font: 600 1.3rem/1.4 var(--font-sans); }
.active-kind { margin-top: .25rem !important; color: var(--ui-primary); font-size: .85rem; }
.active-description, .active-work { margin-top: .8rem !important; max-width: 65ch; font-size: .9rem; }
.active-work { color: var(--ui-text-muted); }
.active-links { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; margin-top: 1.25rem; font-size: .85rem; }
.active-links a { display: inline-flex; align-items: center; gap: .4rem; color: var(--ui-primary); text-decoration: underline; }
@media (max-width: 850px) { .active-list { grid-template-columns: 1fr; gap: 2.5rem; } }
@media (max-width: 400px) { .active-image-wrap { height: 16rem; padding: .75rem; } }
</style>
