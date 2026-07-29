<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
useSeoMeta({ title: 'Login · PoE Wish List' })

const { fetch: refreshSession } = useUserSession()
const toast = useToast()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!form.username.trim() || !form.password) {
    error.value = 'Completá todos los campos'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    })
    await refreshSession()
    toast.add({ title: '¡Bienvenido!', color: 'success' })
    await router.push('/')
  }
  catch (err: any) {
    error.value = err.data?.message ?? 'Error al iniciar sesión'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-3">
          <img src="/favicon.ico" class="w-8 h-8" alt="PoE">
          <h1 class="text-xl font-bold">Iniciar sesión</h1>
        </div>
      </template>

      <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
        <UFormField label="Usuario">
          <UInput
            v-model="form.username"
            placeholder="Tu nombre de usuario"
            autocomplete="username"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Contraseña">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Tu contraseña"
            autocomplete="current-password"
            class="w-full"
          />
        </UFormField>

        <p v-if="error" class="text-sm text-red-500">
          {{ error }}
        </p>

        <UButton
          type="submit"
          :loading="loading"
          block
          class="mt-1"
        >
          Ingresar
        </UButton>
      </form>

      <template #footer>
        <p class="text-sm text-center text-muted">
          ¿No tenés cuenta?
          <NuxtLink to="/register" class="text-primary underline">Registrate</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
