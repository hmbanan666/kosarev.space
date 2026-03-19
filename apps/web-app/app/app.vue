<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <LiveCursors :locale="locale">
      <template #profile-actions="{ shuffle, cursorsHidden, toggleCursors, labels }">
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }">
          <button class="live-cursor-btn" @click="shuffle">
            <UIcon name="i-lucide-shuffle" :style="{ width: '14px', height: '14px' }" />
            {{ labels.shuffle }}
          </button>
          <button
            class="live-cursor-btn"
            :style="cursorsHidden ? { backgroundColor: '#3b2a1a', color: '#f59e0b' } : {}"
            @click="toggleCursors"
          >
            <UIcon :name="cursorsHidden ? 'i-lucide-eye' : 'i-lucide-eye-off'" :style="{ width: '14px', height: '14px' }" />
            {{ cursorsHidden ? labels.showCursors : labels.hideCursors }}
          </button>
          <NuxtLink
            :to="localePath('/cases/kosarev-live-cursors')"
            class="live-cursor-btn"
          >
            <UIcon name="i-lucide-info" :style="{ width: '14px', height: '14px' }" />
            {{ t('liveCursors.howItWorks') }}
          </NuxtLink>
        </div>
      </template>
    </LiveCursors>
  </UApp>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
</script>

<style>
.live-cursor-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  background-color: #262626;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #d4d4d4;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 150ms ease;
}

.live-cursor-btn:hover {
  background-color: #404040;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.live-cursor-btn:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
