<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'es'
  }
})

useSeoMeta({
  title: 'PoE Wish List',
  description: 'Lista colaborativa de items deseados para Path of Exile',
  ogTitle: 'PoE Wish List',
  ogDescription: 'Lista colaborativa de items deseados para Path of Exile'
})

const { loggedIn, user, clear: logout } = useUserSession()
const router = useRouter()
const toast = useToast()

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await logout()
  toast.add({ title: 'Sesión cerrada', color: 'neutral' })
  await router.push('/')
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg">
          <UIcon name="i-lucide-scroll" class="w-5 h-5 text-primary" />
          PoE Wish List
        </NuxtLink>
      </template>

      <template #right>
        <template v-if="loggedIn">
          <span class="hidden sm:inline text-sm text-muted font-medium">
            <UIcon name="i-lucide-user" class="w-4 h-4 inline-block mr-1 align-text-bottom" />
            {{ user?.username }}
          </span>
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-log-out"
            size="sm"
            @click="handleLogout"
          >
            <span class="hidden sm:inline">Salir</span>
          </UButton>
        </template>
        <template v-else>
          <UButton
            to="/login"
            variant="ghost"
            color="neutral"
            icon="i-lucide-log-in"
            size="sm"
          >
            <span class="hidden sm:inline">Ingresar</span>
          </UButton>
          <UButton
            to="/register"
            size="sm"
            icon="i-lucide-user-plus"
          >
            <span class="hidden sm:inline">Registrarse</span>
          </UButton>
        </template>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          PoE Wish List • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
