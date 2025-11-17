<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    background?: 'white' | 'surface'
  }>(),
  {
    background: 'white',
  }
)

const scrollContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

const handleMouseDown = (e: MouseEvent) => {
  if (!scrollContainer.value) return
  // Don't start dragging if clicking on interactive elements
  const target = e.target as HTMLElement
  if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a, button')) {
    return
  }
  isDragging.value = true
  startX.value = e.pageX - scrollContainer.value.offsetLeft
  scrollLeft.value = scrollContainer.value.scrollLeft
  scrollContainer.value.style.cursor = 'grabbing'
  scrollContainer.value.style.userSelect = 'none'
  e.preventDefault()
}

const handleMouseLeave = () => {
  if (!scrollContainer.value) return
  isDragging.value = false
  scrollContainer.value.style.cursor = 'grab'
  scrollContainer.value.style.userSelect = ''
}

const handleMouseUp = () => {
  if (!scrollContainer.value) return
  isDragging.value = false
  scrollContainer.value.style.cursor = 'grab'
  scrollContainer.value.style.userSelect = ''
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !scrollContainer.value) return
  e.preventDefault()
  const x = e.pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX.value) * 2
  scrollContainer.value.scrollLeft = scrollLeft.value - walk
}

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.style.cursor = 'grab'
  }
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

const containerClasses = computed(() => [
  'mitra-event-table-scroll overflow-x-auto rounded-2xl border border-secondary/20',
  props.background === 'surface' ? 'bg-surface' : 'bg-white',
])
</script>

<template>
  <div
    ref="scrollContainer"
    :class="containerClasses"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
  >
    <table class="w-full min-w-max table-auto text-left text-sm">
      <thead
        class="bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-primary border-b border-secondary/10"
      >
        <slot name="header" />
      </thead>
      <tbody class="divide-y divide-secondary/10 bg-white">
        <slot name="body" />
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.mitra-event-table-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(190, 242, 0, 0.4) transparent;
}

.mitra-event-table-scroll::-webkit-scrollbar {
  height: 8px;
}

.mitra-event-table-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.mitra-event-table-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(190, 242, 0, 0.4);
  border-radius: 9999px;
}

.mitra-event-table-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(190, 242, 0, 0.6);
}
</style>

