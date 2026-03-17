<template>
  <div>
    <slot />

    <USeparator />
    <footer class="py-8 text-center text-sm text-dimmed">
      <UContainer>
        <p>&copy; {{ new Date().getFullYear() }} Nick Kosarev</p>
      </UContainer>
    </footer>
  </div>
</template>
