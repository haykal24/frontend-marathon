declare module '@splidejs/vue-splide' {
  import type { Component } from 'vue'

  export const Splide: Component
  export const SplideSlide: Component
}

declare module 'vue' {
  export interface GlobalComponents {
    Splide: (typeof import('@splidejs/vue-splide'))['Splide']
    SplideSlide: (typeof import('@splidejs/vue-splide'))['SplideSlide']
  }
}

export {}
