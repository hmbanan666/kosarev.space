<template>
  <article class="blueprint-frame" :class="{ 'blueprint-frame-accent': accent }">
    <span
      v-if="part"
      class="blueprint-part"
      aria-hidden="true"
    >{{ part }}</span>
    <slot />
  </article>
</template>

<script setup lang="ts">
defineProps<{ part?: string, accent?: boolean }>()
</script>
