<template>
  <component
    :is="componentTag"
    :href="isExternal ? sanitizedTo : undefined"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :type="componentTag === 'button' ? type : undefined"
    :disabled="componentTag === 'button' && isDisabled"
    :aria-disabled="componentTag !== 'button' ? isDisabled : undefined"
    :role="isInternalLink ? 'link' : undefined"
    :class="buttonClasses"
    v-bind="restAttrs"
    @click="handleClick"
  >
    <span
      v-if="props.icon && props.iconPosition === 'left'"
      aria-hidden="true"
      class="flex items-center"
    >
      <component
        :is="props.icon"
        class="h-5 w-5"
      />
    </span>
    <span class="flex items-center gap-1">
      <slot />
    </span>
    <span
      v-if="props.icon && props.iconPosition === 'right'"
      aria-hidden="true"
      class="flex items-center"
    >
      <component
        :is="props.icon"
        class="h-4 w-4"
      />
    </span>
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { computed, useAttrs } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    to?: string
    external?: boolean
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    disabled?: boolean
    icon?: Component | null
    iconPosition?: 'left' | 'right'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    to: undefined,
    external: false,
    type: 'button',
    block: false,
    disabled: false,
    icon: null,
    iconPosition: 'right',
  }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const attrs = useAttrs()
const normalizedAttrs = computed(() => {
  const { class: _class, onClick, ...rest } = attrs
  return rest
})
const clickAttr = computed(() => attrs.onClick as ((event: MouseEvent) => void) | undefined)

const restAttrs = normalizedAttrs

const isDisabled = computed(() => props.disabled)

const sanitizedTo = computed(() => props.to?.trim())
const isInternalLink = computed(() => Boolean(sanitizedTo.value && !props.external))
const isExternal = computed(() => Boolean(sanitizedTo.value && props.external))
const componentTag = computed(() => (isExternal.value ? 'a' : 'button'))

const sizeClasses: Record<typeof props.size, string> = {
  sm: 'px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em]',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-6 py-3 text-base font-semibold',
}

const variantClasses: Record<typeof props.variant, string> = {
  primary:
    'bg-secondary text-primary hover:bg-primary hover:text-secondary focus-visible:ring-secondary/70',
  secondary:
    'bg-primary text-secondary border border-secondary/60 hover:bg-secondary hover:text-primary focus-visible:ring-secondary/70',
  outline:
    'border border-secondary text-white hover:bg-primary hover:text-secondary focus-visible:ring-secondary/60',
  ghost: 'bg-transparent text-white hover:bg-white/10 focus-visible:ring-white/40',
}

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary/50 disabled:opacity-60 disabled:pointer-events-none',
  sizeClasses[props.size],
  variantClasses[props.variant],
  props.block ? 'w-full' : '',
  attrs.class ?? '',
])

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  if (isInternalLink.value && sanitizedTo.value) {
    event.preventDefault()
    event.stopPropagation()
    navigateTo(sanitizedTo.value)
  }

  clickAttr.value?.(event)
  emit('click', event)
}
</script>
