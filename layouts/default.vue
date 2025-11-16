<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <NuxtRouteAnnouncer />
    <LayoutHeader />

    <main class="flex-1">
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>
