<template>
  <div
    v-show="!cursorsHidden"
    data-live-cursors
    class="cursor-overlay"
  >
    <TransitionGroup name="live-cursor">
      <div
        v-for="cursor in cursors"
        :key="cursor.id"
        class="cursor-peer"
        :style="cursorPosition(cursor)"
      >
        <svg
          width="18"
          height="22"
          viewBox="0 0 18 22"
          fill="none"
          class="cursor-arrow"
        >
          <path
            d="M2.5 1L16 12.5H8.5L5.5 21L2.5 1Z"
            :fill="cursor.color"
            stroke="white"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
        <div
          class="cursor-label"
          :style="{ backgroundColor: cursor.color }"
        >
          <img
            :src="cursor.avatar"
            :alt="cursorName(cursor)"
            class="cursor-avatar"
          >
          <slot name="cursor-name" :cursor="cursor">
            {{ cursorName(cursor) }}
          </slot>
        </div>
      </div>
    </TransitionGroup>
  </div>

  <!-- Profile popover -->
  <Transition name="live-cursor-pop">
    <div
      v-if="showProfile"
      data-live-cursors-profile
      class="cursor-profile"
    >
      <img
        :src="myAvatar"
        class="profile-avatar"
        :style="{ outline: `2px solid ${myColor}` }"
      >
      <span
        class="profile-name"
        :style="{ backgroundColor: myColor }"
      >
        <slot name="my-name">
          {{ resolveName(myNameKey) }}
        </slot>
      </span>
      <p class="profile-caption">
        {{ labels.you }}
      </p>
      <slot
        name="profile-actions"
        :shuffle="shuffle"
        :cursors-hidden="cursorsHidden"
        :toggle-cursors="() => cursorsHidden = !cursorsHidden"
        :labels="labels"
      />
    </div>
  </Transition>

  <!-- Online bar -->
  <Transition name="live-cursor-fade">
    <button
      v-if="onlineCount > 0"
      data-live-cursors-bar
      class="presence-pill"
      @click="showProfile = !showProfile"
    >
      <span
        class="presence-status"
      >
        <span
          class="status-ping"
        />
        <span
          class="status-light"
        />
      </span>
      <div class="presence-faces">
        <img
          v-for="(user, index) in onlineUsers.slice(0, 8)"
          :key="user.id"
          :src="user.avatar"
          :alt="userName(user)"
          :title="userName(user)"
          class="presence-face"
          :style="{ marginLeft: index > 0 ? '-6px' : '0' }"
        >
        <div
          v-if="onlineUsers.length > 8"
          class="presence-overflow"
        >
          +{{ onlineUsers.length - 8 }}
        </div>
      </div>
      <span class="presence-count">
        <slot name="online-text" :count="onlineCount">
          {{ labels.online?.replace("{count}", String(onlineCount)) }}
        </slot>
      </span>
    </button>
  </Transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { getLocale } from '~/utils/presence'

const props = defineProps({
  locale: { type: String, required: false, default: 'en' },
  coordinateTarget: { type: String, required: false, default: '' },
})
const l = computed(() => getLocale(props.locale))
const labels = computed(() => l.value.ui)
const { cursors, cursorsHidden, onlineUsers, onlineCount, myNameKey, myColor, myAvatar, shuffle } = useLiveCursors()
function resolveName(nameKey) {
  return l.value.names[nameKey] || nameKey
}
function cursorName(cursor) {
  return resolveName(cursor.nameKey)
}
function userName(user) {
  return resolveName(user.nameKey)
}
// Both canvas axes are normalized (Y uses 10000 units for integer transport).
const geometryVersion = ref(0)
function cursorPosition(cursor) {
  void geometryVersion.value
  if (!cursor.page.endsWith('#coordinates-v2')) {
    return { left: `${cursor.x * viewportWidth.value}px`, top: `${cursor.y - scrollY.value}px` }
  }
  const element = props.coordinateTarget ? document.querySelector(props.coordinateTarget) : null
  const rect = element?.getBoundingClientRect()
  if (!rect?.width) {
    return { display: 'none' }
  }
  const clip = element.closest('[data-live-cursors-viewport]')?.getBoundingClientRect() || rect
  const x = rect.left + cursor.x * rect.width
  const y = rect.top + cursor.y * rect.height / 10000
  return { left: `${x}px`, top: `${y}px`, visibility: x < clip.left || x > clip.right || y < clip.top || y > clip.bottom ? 'hidden' : 'visible' }
}
const scrollY = ref(0)
const viewportWidth = ref(0)
const showProfile = ref(false)
if (import.meta.client) {
  const onScroll = () => {
    scrollY.value = window.scrollY
    geometryVersion.value++
  }
  const onResize = () => {
    viewportWidth.value = window.innerWidth
    geometryVersion.value++
  }
  const onClickOutside = (e) => {
    const target = e.target
    if (showProfile.value && target instanceof Element && !target.closest('[data-live-cursors-bar]') && !target.closest('[data-live-cursors-profile]')) {
      showProfile.value = false
    }
  }
  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('live-cursors:coordinates', onScroll)
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('click', onClickOutside)
    onScroll()
    onResize()
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('live-cursors:coordinates', onScroll)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('click', onClickOutside)
  })
}
</script>

<style scoped>
.cursor-overlay { pointer-events: none; position: fixed; inset: 0; z-index: 100; overflow: hidden; }
.cursor-peer { position: absolute; transition: all 150ms ease-out; }
.cursor-arrow { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
.cursor-label { margin-left: 12px; margin-top: -4px; display: flex; align-items: center; gap: 6px; white-space: nowrap; border-radius: 9999px; padding: 2px 10px 2px 2px; font-size: 12px; font-weight: 500; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
.cursor-avatar { height: 24px; width: 24px; border-radius: 9999px; background-color: rgba(255,255,255,0.2); }
.cursor-profile { position: fixed; left: 50%; bottom: 64px; transform: translateX(-50%); z-index: 50; display: flex; flex-direction: column; align-items: center; gap: 12px; border-radius: 16px; border: 1px solid rgba(64,64,64,0.5); background-color: rgba(23,23,23,0.9); padding: 16px 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); backdrop-filter: blur(8px); }
.profile-avatar { height: 64px; width: 64px; border-radius: 9999px; outline-offset: 2px; }
.profile-name { border-radius: 9999px; padding: 2px 10px; font-size: 14px; font-weight: 500; color: white; }
.profile-caption { font-size: 12px; color: #737373; margin: 0; }
.presence-pill { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 50; display: flex; align-items: center; gap: 12px; border-radius: 9999px; border: 1px solid rgba(64,64,64,0.5); background-color: rgba(23,23,23,0.8); padding: 8px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); backdrop-filter: blur(8px); cursor: pointer; transition: all 150ms; font-family: inherit; }
.presence-status { position: relative; display: flex; height: 8px; width: 8px; flex-shrink: 0; }
.status-ping { opacity: .75; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #4ade80; animation: live-cursor-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
.status-light { position: relative; display: inline-flex; height: 8px; width: 8px; border-radius: 9999px; background-color: #22c55e; }
.presence-faces { display: flex; }
.presence-face { height: 24px; width: 24px; border-radius: 9999px; outline: 2px solid #171717; }
.presence-overflow { height: 24px; width: 24px; border-radius: 9999px; background-color: #404040; font-size: 10px; font-weight: 500; color: #a3a3a3; outline: 2px solid #171717; margin-left: -6px; display: flex; align-items: center; justify-content: center; }
.presence-count { font-size: 12px; color: #a3a3a3; }

@keyframes live-cursor-ping{75%,to{opacity:0;transform:scale(2)}}
.live-cursor-enter-active{transition:opacity .3s ease,transform .3s ease}
.live-cursor-leave-active{transition:opacity .2s ease,transform .2s ease}
.live-cursor-enter-from,.live-cursor-leave-to{opacity:0;transform:scale(.5)}
.live-cursor-fade-enter-active,.live-cursor-fade-leave-active{transition:opacity .3s ease}
.live-cursor-fade-enter-from,.live-cursor-fade-leave-to{opacity:0}
.live-cursor-pop-enter-active{transition:opacity .25s cubic-bezier(.34,1.56,.64,1),transform .25s cubic-bezier(.34,1.56,.64,1)}
.live-cursor-pop-leave-active{transition:opacity .2s ease-in,transform .2s ease-in}
.live-cursor-pop-enter-from{opacity:0;transform:translateY(12px) scale(.9)}
.live-cursor-pop-leave-to{opacity:0;transform:translateY(6px) scale(.92)}
</style>
