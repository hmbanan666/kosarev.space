<template>
  <span
    class="blueprint-mark"
    :class="`blueprint-${kind}`"
    aria-hidden="true"
  ><slot /></span>
</template>

<script setup lang="ts">
defineProps<{ kind: 'zone' | 'dimension' | 'crosshair' | 'ruler' | 'title' | 'hatching' }>()
</script>
