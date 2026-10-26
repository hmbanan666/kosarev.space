<template>
  <div
    class="peer-cursors"
    data-live-cursors
    aria-hidden="true"
  >
    <svg
      v-for="cursor in visibleCursors"
      :key="cursor.id"
      :data-peer-cursor="cursor.id"
      class="peer-cursor"
      width="16"
      height="20"
      viewBox="0 0 18 22"
      :style="{ left: `${cursor.x * width}px`, top: `${cursor.y - y}px`, color: cursor.color }"
    >
      <path
        d="M2.5 1L16 12.5H8.5L5.5 21L2.5 1Z"
        fill="currentColor"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { connected, count } = usePortfolioPresence()
const { cursors, onlineCount, isConnected } = useLiveCursors()
const { width, height } = useWindowSize()
const { y } = useWindowScroll()
const page = computed(() => route.path.replace(/^\/en(?=\/|$)/, '') || '/')
const visibleCursors = computed(() => cursors.value.filter((cursor) => cursor.page === page.value && cursor.x >= 0 && cursor.x <= 1 && cursor.y >= y.value && cursor.y <= y.value + height.value))
onBeforeMount(() => {
  isConnected.value = false
  onlineCount.value = 0
  cursors.value = []
})
watchEffect(() => {
  connected.value = isConnected.value
  count.value = isConnected.value ? onlineCount.value : 0
})
onUnmounted(() => {
  isConnected.value = false
  connected.value = false
  count.value = 0
})
</script>

<style scoped>
.peer-cursors { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 30; }
.peer-cursor { position: absolute; pointer-events: none; filter: drop-shadow(0 1px 2px #0009); }
@media print { .peer-cursors { display: none; } }
</style>
