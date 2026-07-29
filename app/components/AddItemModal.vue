<script setup lang="ts">
import type { PoeSearchResult } from '~/server/utils/poe-search'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'added': []
}>()

const toast = useToast()

const query = ref('')
const results = ref<PoeSearchResult[]>([])
const searching = ref(false)
const selected = ref<PoeSearchResult | null>(null)
const observation = ref('')
const submitting = ref(false)
const submitError = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (val) => {
  if (selected.value && val !== selected.value.name) {
    selected.value = null
    results.value = []
  }
  if (searchTimer) clearTimeout(searchTimer)
  if (!val.trim() || val.trim().length < 2) {
    results.value = []
    return
  }
  searchTimer = setTimeout(() => doSearch(val.trim()), 350)
})

watch(() => props.open, (val) => {
  if (!val) resetForm()
})

async function doSearch(q: string) {
  searching.value = true
  try {
    results.value = await $fetch<PoeSearchResult[]>(`/api/poe/search?q=${encodeURIComponent(q)}`)
  }
  catch {
    results.value = []
  }
  finally {
    searching.value = false
  }
}

function selectItem(item: PoeSearchResult) {
  selected.value = item
  query.value = item.name
  results.value = []
}

async function handleSubmit() {
  submitError.value = ''
  if (!selected.value) {
    submitError.value = 'Seleccioná un item de la búsqueda'
    return
  }
  submitting.value = true
  try {
    await $fetch('/api/items', {
      method: 'POST',
      body: {
        poeItemId: selected.value.id,
        name: selected.value.name,
        icon: selected.value.icon || null,
        category: selected.value.category || null,
        baseType: selected.value.baseType || null,
        observation: observation.value.trim() || null
      }
    })
    emit('added')
    closeModal()
  }
  catch (err: any) {
    const msg = err.data?.message ?? 'Error al agregar el item'
    submitError.value = msg
    if (err.status === 409) {
      toast.add({ title: 'Item duplicado', description: msg, color: 'warning' })
    }
  }
  finally {
    submitting.value = false
  }
}

function closeModal() {
  resetForm()
  emit('update:open', false)
}

function resetForm() {
  query.value = ''
  results.value = []
  selected.value = null
  observation.value = ''
  submitError.value = ''
  searching.value = false
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Agregar item a la lista</h2>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              size="sm"
              @click="closeModal"
            />
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <!-- Search input -->
          <UFormField label="Buscar item">
            <UInput
              v-model="query"
              placeholder="Ej: Tabula Rasa, Kaom's Heart…"
              :loading="searching"
              icon="i-lucide-search"
              autocomplete="off"
              class="w-full"
            />
          </UFormField>

          <!-- Inline results list (no absolute positioning) -->
          <div
            v-if="results.length > 0 && !selected"
            class="rounded-lg border border-[var(--ui-border)] overflow-hidden max-h-56 overflow-y-auto"
          >
            <button
              v-for="result in results"
              :key="result.id"
              type="button"
              class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--ui-bg-elevated)] active:bg-[var(--ui-bg-accented)] text-left transition-colors border-b border-[var(--ui-border-muted)] last:border-0"
              @click="selectItem(result)"
            >
              <div class="w-9 h-9 shrink-0 flex items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <img
                  v-if="result.icon"
                  :src="result.icon"
                  :alt="result.name"
                  class="w-7 h-7 object-contain"
                  loading="lazy"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                >
                <UIcon v-else name="i-lucide-gem" class="w-5 h-5 text-[var(--ui-text-muted)]" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ result.name }}</p>
                <p v-if="result.baseType" class="text-xs text-[var(--ui-text-muted)] truncate">{{ result.baseType }}</p>
                <p v-if="result.category" class="text-xs text-[var(--ui-text-toned)] truncate capitalize">{{ result.category }}</p>
              </div>
            </button>
          </div>

          <!-- Selected item preview -->
          <div
            v-if="selected"
            class="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
          >
            <div class="w-12 h-12 shrink-0 flex items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <img
                v-if="selected.icon"
                :src="selected.icon"
                :alt="selected.name"
                class="w-10 h-10 object-contain"
              >
              <UIcon v-else name="i-lucide-gem" class="w-7 h-7 text-muted" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold truncate">{{ selected.name }}</p>
              <p v-if="selected.baseType" class="text-sm text-muted truncate">{{ selected.baseType }}</p>
              <UBadge v-if="selected.category" :label="selected.category" variant="subtle" size="xs" class="capitalize" />
            </div>
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="selected = null; query = ''"
            />
          </div>

          <!-- Observation -->
          <UFormField label="Observación (opcional)">
            <UTextarea
              v-model="observation"
              placeholder="¿Alguna nota sobre este item? (precio buscado, para qué build, etc.)"
              :rows="3"
              class="w-full"
            />
          </UFormField>

          <p v-if="submitError" class="text-sm text-red-500">
            {{ submitError }}
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" color="neutral" @click="closeModal">
              Cancelar
            </UButton>
            <UButton
              :loading="submitting"
              :disabled="!selected"
              icon="i-lucide-plus"
              @click="handleSubmit"
            >
              Agregar a la lista
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
