<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-secondary/70 bg-white overflow-hidden">
    <div class="p-5 border-b border-secondary/10 bg-gray-50/50">
      <h3 class="text-base font-semibold text-primary leading-6">
        {{ title }}
      </h3>
      <p
        v-if="description"
        class="mt-1 text-sm text-gray-500"
      >
        {{ description }}
      </p>
    </div>
    <div class="p-5">
      <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <slot />
      </dl>
    </div>
  </div>
</template>
