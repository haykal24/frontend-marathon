<script setup lang="ts">
import { useSeoMetaDynamic } from '~/composables/useSeoMeta'

useSeoMetaDynamic({
  // Canonical will be set per-page; layout provides base only if missing
  type: 'website',
})
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="relative mx-auto min-h-screen flex items-center justify-center ">
      <slot />
    </div>
  </div>
</template>

<style scoped>
</style>

