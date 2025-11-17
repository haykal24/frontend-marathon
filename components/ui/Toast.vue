<script setup lang="ts">
import { ref, watch } from 'vue'
import IconMdiCheckCircle from '~icons/mdi/check-circle'
import IconMdiAlertCircle from '~icons/mdi/alert-circle'
import IconMdiClose from '~icons/mdi/close'

interface Props {
  show: boolean
  type?: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(props.show)
let timeout: ReturnType<typeof setTimeout> | null = null

watch(() => props.show, (newVal) => {
  isVisible.value = newVal
  if (newVal && props.duration > 0) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      isVisible.value = false
      emit('close')
    }, props.duration)
  }
})

const handleClose = () => {
  if (timeout) clearTimeout(timeout)
  isVisible.value = false
  emit('close')
}

const bgClass = computed(() => {
  return {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }[props.type]
})

const textClass = computed(() => {
  return {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }[props.type]
})

const iconClass = computed(() => {
  return {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  }[props.type]
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isVisible"
        class="fixed top-4 right-4 z-[9999] max-w-md w-full"
      >
        <div
          :class="[
            'rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-sm',
            bgClass
          ]"
        >
          <div class="flex items-start gap-3">
            <div :class="['flex-shrink-0', iconClass]">
              <IconMdiCheckCircle
                v-if="type === 'success'"
                class="h-6 w-6"
              />
              <IconMdiAlertCircle
                v-else
                class="h-6 w-6"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p :class="['text-sm font-semibold', textClass]">
                {{ message }}
              </p>
            </div>
            <button
              type="button"
              :class="['flex-shrink-0 hover:opacity-70 transition-opacity', textClass]"
              @click="handleClose"
            >
              <IconMdiClose class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

