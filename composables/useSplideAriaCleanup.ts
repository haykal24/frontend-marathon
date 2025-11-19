import { onBeforeUnmount, onMounted } from 'vue'

const sanitizeSplideRoles = () => {
  document.querySelectorAll<HTMLElement>('.splide__slide[role]').forEach(slide => {
    slide.removeAttribute('role')
  })
}

export const useSplideAriaCleanup = () => {
  let observer: MutationObserver | null = null

  onMounted(() => {
    sanitizeSplideRoles()

    observer = new MutationObserver(mutations => {
      let shouldSanitize = false

      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.target instanceof HTMLElement &&
          mutation.target.classList.contains('splide__slide') &&
          mutation.attributeName === 'role'
        ) {
          mutation.target.removeAttribute('role')
        } else {
          shouldSanitize = true
        }
      }

      if (shouldSanitize) {
        sanitizeSplideRoles()
      }
    })

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['role'],
    })
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })
}

