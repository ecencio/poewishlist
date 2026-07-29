<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import type { PoeSearchResult } from '~/server/utils/poe-search'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'added': []
}>()

const toast = useToast()

// Step: 'search' | 'confirm'
const step = ref<'search' | 'confirm'>('search')
const selected = ref<PoeSearchResult | null>(null)
const observation = ref('')
const submitting = ref(false)
const submitError = ref('')

// CommandPalette state
const searchTerm = ref('')
const searching = ref(false)
const searchResults = ref<PoeSearchResult[]>([])

let searchTimer: ReturnType<typeof setTimeout> | null = null

// Build CommandPalette groups from search results
const groups = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'poe-items',
    label: searchTerm.value.length >= 2 ? `Resultados para "${searchTerm.value}"` : 'Escribí para buscar…',
    ignoreFilter: true,
    items: searchResults.value.map(item => ({
      label: item.name,
      suffix: item.category || undefined,
      avatar: item.icon
        ? { src: item.icon, alt: item.name }
        : undefined,
      icon: item.icon ? undefined : 'i-lucide-gem',
      // Store the full result on the item
      _result: item,
      onSelect() {
        selectItem(item)
      }
    })) as CommandPaletteItem[]
  }
])

// Watch searchTerm changes (fed by UCommandPalette v-model:search-term)
watch(searchTerm, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (!val.trim() || val.trim().length < 2) {
    searchResults.value = []
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
    searchResults.value = await $fetch<PoeSearchResult[]>(
      `/api/poe/search?q=${encodeURIComponent(q)}`
    )
  }
  catch {
    searchResults.value = []
  }
  finally {
    searching.value = false
  }
}

function selectItem(item: PoeSearchResult) {
  selected.value = item
  step.value = 'confirm'
}

function backToSearch() {
  step.value = 'search'
  selected.value = null
  submitError.value = ''
}

async function handleSubmit() {
  if (!selected.value) return
  submitError.value = ''
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
    emit('update:open', false)
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

function resetForm() {
  step.value = 'search'
  selected.value = null
  observation.value = ''
  submitError.value = ''
  searchTerm.value = ''
  searchResults.value = []
  searching.value = false
}
</script>

<template>
  <USlideover
    :open="open"
    title="Agregar item a la lista"
    description="Buscá y seleccioná un item de Path of Exile 2"
    side="right"
    :ui="{ body: 'p-0 flex flex-col flex-1 min-h-0' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <!-- Step 1: Search -->
      <div v-if="step === 'search'" class="flex flex-col flex-1 min-h-0">
        <UCommandPalette
          v-model:search-term="searchTerm"
          :groups="groups"
          :loading="searching"
          placeholder="Ej: Tabula Rasa, Kaom's Heart…"
          :fuse="{ fuseOptions: { threshold: 1 } }"
          class="flex-1"
        >
          <template #empty>
            <div class="flex flex-col items-center gap-2 py-8 text-muted">
              <UIcon
                :name="searchTerm.length < 2 ? 'i-lucide-search' : 'i-lucide-frown'"
                class="w-10 h-10 opacity-30"
              />
              <p class="text-sm">
                {{ searchTerm.length < 2 ? 'Escribí al menos 2 caracteres' : 'Sin resultados' }}
              </p>
            </div>
          </template>
        </UCommandPalette>
      </div>

      <!-- Step 2: Confirm + observation -->
      <div v-else-if="step === 'confirm' && selected" class="flex flex-col gap-5 p-4 flex-1">
        <!-- Back -->
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          size="sm"
          class="self-start -ml-1"
          @click="backToSearch"
        >
          Volver a buscar
        </UButton>

        <!-- Selected item card -->
        <div class="flex items-center gap-4 p-4 rounded-xl border border-primary/25 bg-primary/5">
          <div class="w-16 h-16 shrink-0 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <img
              v-if="selected.icon"
              :src="selected.icon"
              :alt="selected.name"
              class="w-14 h-14 object-contain"
            >
            <UIcon v-else name="i-lucide-gem" class="w-9 h-9 text-muted" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-base truncate">{{ selected.name }}</p>
            <p v-if="selected.baseType" class="text-sm text-muted truncate">
              {{ selected.baseType }}
            </p>
            <UBadge
              v-if="selected.category"
              :label="selected.category"
              variant="subtle"
              size="xs"
              class="mt-1 capitalize"
            />
          </div>
          <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-primary shrink-0" />
        </div>

        <!-- Observation -->
        <UFormField
          label="Observación"
          hint="Opcional"
        >
          <UTextarea
            v-model="observation"
            placeholder="Precio buscado, para qué build, notas…"
            :rows="4"
            class="w-full"
            autofocus
          />
        </UFormField>

        <p v-if="submitError" class="text-sm text-red-500">
          {{ submitError }}
        </p>

        <div class="mt-auto pt-4 border-t border-[var(--ui-border-muted)]">
          <UButton
            block
            size="lg"
            icon="i-lucide-plus"
            :loading="submitting"
            @click="handleSubmit"
          >
            Agregar a la lista
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>
