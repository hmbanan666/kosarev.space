<template>
  <div class="flex flex-col items-center gap-4">
    <div class="relative">
      <UIcon name="i-lucide-search" class="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        :value="searchQuery"
        :placeholder="searchPlaceholder"
        autocomplete="off"
        class="h-10 w-64 rounded-full border border-default/50 bg-transparent pl-10 pr-4 text-base text-highlighted placeholder:text-muted/50 outline-none transition-all duration-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        v-for="tag in tags"
        :key="tag.name"
        class="rounded-full border px-3 py-1 font-medium transition-all duration-200"
        :class="[
          sizeClass(tag.count),
          modelValue.includes(tag.name)
            ? 'border-primary bg-primary/15 text-primary shadow-sm shadow-primary/25'
            : 'border-default/50 text-muted hover:border-primary/50 hover:text-highlighted',
        ]"
        @click="toggle(tag.name)"
      >
        {{ tag.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TagInfo {
  name: string
  count: number
}

const props = defineProps<{
  tags: TagInfo[]
  modelValue: string[]
  searchQuery: string
  searchPlaceholder: string
}>()

const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
  'update:searchQuery': [query: string]
}>()

function sizeClass(count: number) {
  if (count >= 6) {
    return 'text-lg px-4 py-1.5'
  }
  if (count >= 3) {
    return 'text-base'
  }
  return 'text-sm'
}

function toggle(tag: string) {
  const selected = props.modelValue.includes(tag)
    ? props.modelValue.filter((t) => t !== tag)
    : [...props.modelValue, tag]
  emit('update:modelValue', selected)
}
</script>
