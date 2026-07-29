<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
useSeoMeta({ title: 'Registro · PoE Wish List' })

const { fetch: refreshSession } = useUserSession()
const toast = useToast()
const router = useRouter()

const form = reactive({ username: '', password: '', confirm: '' })
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  if (!form.username.trim() || !form.password || !form.confirm) {
    error.value = 'Completá todos los campos'
    return
  }
  if (form.username.trim().length < 3) {
    error.value = 'El usuario debe tener al menos 3 caracteres'
    return
  }
  if (form.password.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  if (form.password !== form.confirm) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username: form.username.trim(), password: form.password }
    })
    await refreshSession()
    toast.add({ title: '¡Cuenta creada!', description: `Bienvenido, ${form.username.trim()}`, color: 'success' })
    await router.push('/')
  }
  catch (err: any) {
    error.value = err.data?.message ?? 'Error al registrarse'
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
          <h1 class="text-xl font-bold">Crear cuenta</h1>
        </div>
      </template>

      <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
        <UFormField label="Usuario">
          <UInput
            v-model="form.username"
            placeholder="Elegí un nombre de usuario"
            autocomplete="username"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Contraseña">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autocomplete="new-password"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Confirmar contraseña">
          <UInput
            v-model="form.confirm"
            type="password"
            placeholder="Repetí la contraseña"
            autocomplete="new-password"
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
          Registrarse
        </UButton>
      </form>

      <template #footer>
        <p class="text-sm text-center text-muted">
          ¿Ya tenés cuenta?
          <NuxtLink to="/login" class="text-primary underline">Iniciá sesión</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
