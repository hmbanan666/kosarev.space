<template>
  <div class="case-select-field">
    <label :for="id">{{ label }}</label>
    <ClientOnly>
      <USelect
        :id="id"
        v-model="selected"
        :name="name"
        :aria-label="label"
        :items="selectItems"
        variant="none"
        size="lg"
        trailing-icon="i-lucide-chevron-down"
        :content="selectContent"
        :ui="{ base: 'case-select-trigger', content: 'case-select-menu', item: 'case-select-option' }"
      />
      <template #fallback>
        <select
          :id="id"
          v-model="model"
          :name="name"
          class="case-native-select"
        >
          <option
            v-for="item in items"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string
  name: string
  label: string
  items: { label: string, value: string }[]
}>()
const model = defineModel<string>({ required: true })
// Reka Select reserves an empty value for its placeholder.
const emptyValue = '__all__'
const selectContent = { sideOffset: 6, collisionPadding: 16 }
// Prevent the browser's synthetic Enter click after Reka restores trigger focus.
function preventEnterClick(event: Event) {
  if (event instanceof CustomEvent) {
    const original = event.detail?.originalEvent
    if (original instanceof KeyboardEvent && original.key === 'Enter') {
      original.preventDefault()
    }
  }
}
const selectItems = computed(() => props.items.map((item) => ({
  ...item,
  value: item.value || emptyValue,
  onSelect: preventEnterClick,
})))
const selected = computed({
  get: () => model.value || emptyValue,
  set: (value: string) => {
    model.value = value === emptyValue ? '' : value
  },
})
</script>
