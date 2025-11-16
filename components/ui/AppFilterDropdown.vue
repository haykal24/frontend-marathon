<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import IconMdiChevronDown from '~icons/mdi/chevron-down'
import IconMdiCheck from '~icons/mdi/check'
import { computed } from 'vue'

interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number | (string | number)[]
  options: Option[]
  placeholder: string
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]]
}>()

const displayLabel = computed(() => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    if (values.length === 0) return props.placeholder
    if (values.length === 1)
      return props.options.find(o => o.value === values[0])?.label || props.placeholder
    return `${values.length} dipilih`
  } else {
    return props.options.find(o => o.value === props.modelValue)?.label || props.placeholder
  }
})

const isSelected = (value: string | number) => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return values.includes(value)
  } else {
    return props.modelValue === value
  }
}

const handleChange = (value: string | number) => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = values.indexOf(value)
    if (index > -1) {
      values.splice(index, 1)
    } else {
      values.push(value)
    }
    emit('update:modelValue', values)
  } else {
    emit('update:modelValue', props.modelValue === value ? '' : value)
  }
}
</script>

<template>
  <Listbox
    v-if="multiple"
    :model-value="modelValue"
    multiple
  >
    <div class="relative w-full">
      <ListboxButton
        class="relative w-full cursor-default rounded-lg border border-secondary/60 bg-white py-2.5 pl-3 pr-10 text-left h-10 focus:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/20 sm:text-sm"
      >
        <span class="block truncate">{{ displayLabel }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <IconMdiChevronDown
            class="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-50 right-0 mt-2 max-h-60 w-max min-w-[14rem] max-w-[90vw] overflow-auto rounded-lg bg-white text-base shadow-lg ring-1 ring-secondary/40 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-for="option in options"
            :key="option.value"
            v-slot="{ active }"
            :value="option.value"
            as="template"
          >
            <li
              :class="[
                active ? 'bg-secondary/10 text-primary' : 'text-gray-900',
                'relative cursor-default select-none py-2 pl-10 pr-4',
              ]"
              @click="handleChange(option.value)"
            >
              <span class="block truncate">{{ option.label }}</span>
              <span
                v-if="isSelected(option.value)"
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary"
              >
                <IconMdiCheck
                  class="h-5 w-5"
                  aria-hidden="true"
                />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>

  <!-- Single Select Mode -->
  <Listbox
    v-else
    :model-value="modelValue"
    @update:model-value="value => $emit('update:modelValue', value)"
  >
    <div class="relative w-full">
      <ListboxButton
        class="relative w-full cursor-default rounded-lg border border-secondary/60 bg-white py-2.5 pl-3 pr-10 text-left h-10 focus:outline-none focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/20 sm:text-sm"
      >
        <span class="block truncate">{{ displayLabel }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <IconMdiChevronDown
            class="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-50 right-0 mt-2 max-h-60 w-max min-w-[14rem] max-w-[90vw] overflow-auto rounded-lg bg-white text-base shadow-lg ring-1 ring-secondary/40 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            v-slot="{ active, selected }"
            :value="''"
          >
            <li
              :class="[
                active ? 'bg-secondary/10 text-primary' : 'text-gray-900',
                'relative cursor-default select-none py-2 pl-10 pr-4',
              ]"
            >
              <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate italic']">{{
                placeholder
              }}</span>
            </li>
          </ListboxOption>
          <ListboxOption
            v-for="option in options"
            :key="option.value"
            v-slot="{ active, selected }"
            :value="option.value"
            as="template"
          >
            <li
              :class="[
                active ? 'bg-secondary/10 text-primary' : 'text-gray-900',
                'relative cursor-default select-none py-2 pl-10 pr-4',
              ]"
            >
              <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                option.label
              }}</span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary"
              >
                <IconMdiCheck
                  class="h-5 w-5"
                  aria-hidden="true"
                />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
