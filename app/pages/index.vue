<script setup lang="ts">
useSeoMeta({ title: 'PoE Wish List' })

const { loggedIn } = useUserSession()
const toast = useToast()

interface WishItem {
  id: number
  poe_item_id: string
  name: string
  icon: string | null
  category: string | null
  base_type: string | null
  observation: string | null
  added_by_id: number
  added_by_username: string
  found_by_id: number | null
  found_by_username: string | null
  found_at: string | null
  created_at: string
}

const { data: items, refresh } = await useFetch<WishItem[]>('/api/items', {
  default: () => []
})

// Sorted: unfound first, then found
const sortedItems = computed(() =>
  [...(items.value ?? [])].sort((a, b) => {
    if (!!a.found_by_id === !!b.found_by_id) return 0
    return a.found_by_id ? 1 : -1
  })
)

// View mode persisted in localStorage
const viewMode = ref<'grid' | 'list'>('grid')

onMounted(() => {
  const saved = localStorage.getItem('poe-wishlist-view')
  if (saved === 'list' || saved === 'grid') viewMode.value = saved
})

watch(viewMode, (val) => {
  localStorage.setItem('poe-wishlist-view', val)
}, { immediate: false })

const showModal = ref(false)
const showSlideover = ref(false)
const togglingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)

async function toggleFound(item: WishItem) {
  if (!loggedIn.value) return
  togglingId.value = item.id
  try {
    const updated = await $fetch<WishItem>(`/api/items/${item.id}/found`, { method: 'PATCH' })
    // Reemplazar el array completo para forzar reactividad con shallowRef
    items.value = items.value!.map(i => i.id === updated.id ? updated : i)
    toast.add({
      title: updated.found_by_id ? '¡Encontrado!' : 'Desmarcado',
      color: updated.found_by_id ? 'success' : 'neutral'
    })
  }
  catch (err: any) {
    toast.add({ title: 'Error', description: err.data?.message, color: 'error' })
  }
  finally {
    togglingId.value = null
  }
}

async function deleteItem(item: WishItem) {
  deletingId.value = item.id
  try {
    await $fetch(`/api/items/${item.id}`, { method: 'DELETE' })
    items.value = items.value!.filter(i => i.id !== item.id)
    toast.add({ title: 'Item eliminado', color: 'neutral' })
  }
  catch (err: any) {
    toast.add({ title: 'Error', description: err.data?.message, color: 'error' })
  }
  finally {
    deletingId.value = null
  }
}

function onItemAdded() {
  refresh()
  toast.add({ title: 'Item agregado a la lista', color: 'success' })
}

const pendingCount = computed(() => (items.value ?? []).filter(i => !i.found_by_id).length)
const foundCount = computed(() => (items.value ?? []).filter(i => i.found_by_id).length)
</script>

<template>
  <UContainer class="py-8">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          PoE Wish List
        </h1>
        <p class="text-muted mt-1 text-sm">
          <span class="text-[var(--ui-text)]">{{ pendingCount }}</span> pendiente{{ pendingCount !== 1 ? 's' : '' }}
          · <span class="text-green-600 dark:text-green-400">{{ foundCount }}</span> encontrado{{ foundCount !== 1 ? 's' : '' }}
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- View toggle -->
        <UFieldGroup size="sm">
          <UButton
            icon="i-lucide-layout-grid"
            :color="viewMode === 'grid' ? 'primary' : 'neutral'"
            :variant="viewMode === 'grid' ? 'solid' : 'outline'"
            @click="viewMode = 'grid'"
          />
          <UButton
            icon="i-lucide-list"
            :color="viewMode === 'list' ? 'primary' : 'neutral'"
            :variant="viewMode === 'list' ? 'solid' : 'outline'"
            @click="viewMode = 'list'"
          />
        </UFieldGroup>

        <template v-if="loggedIn">
          <UButton icon="i-lucide-plus" size="sm" @click="showSlideover = true">
            Agregar item
          </UButton>
          <!-- <UButton
            icon="i-lucide-layout-panel-left"
            size="sm"
            variant="subtle"
            color="neutral"
            @click="showModal = true"
          /> -->
        </template>
        <UButton
          v-else
          to="/login"
          variant="subtle"
          icon="i-lucide-log-in"
          size="sm"
        >
          Ingresar para agregar
        </UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="sortedItems.length === 0"
      class="flex flex-col items-center justify-center gap-4 py-20 text-muted"
    >
      <UIcon name="i-lucide-scroll" class="w-14 h-14 opacity-30" />
      <p class="text-lg">La lista está vacía</p>
      <p v-if="loggedIn" class="text-sm">
        Agregá el primer item usando el botón de arriba
      </p>
      <UButton v-else to="/login" variant="subtle" size="sm">
        Iniciá sesión para agregar items
      </UButton>
    </div>

    <!-- Grid view -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <ItemCard
        v-for="item in sortedItems"
        :key="item.id"
        :item="item"
        :toggling="togglingId === item.id"
        :deleting="deletingId === item.id"
        @toggle-found="toggleFound(item)"
        @delete="deleteItem(item)"
      />
    </div>

    <!-- List view -->
    <div
      v-else
      class="rounded-xl border border-[var(--ui-border)] overflow-hidden"
    >
      <ItemRow
        v-for="item in sortedItems"
        :key="item.id"
        :item="item"
        :toggling="togglingId === item.id"
        :deleting="deletingId === item.id"
        @toggle-found="toggleFound(item)"
        @delete="deleteItem(item)"
      />
    </div>

    <!-- Add Item Modal (original) -->
    <AddItemModal
      v-model:open="showModal"
      @added="onItemAdded"
    />

    <!-- Add Item Slideover (nuevo con UCommandPalette) -->
    <AddItemSlideover
      v-model:open="showSlideover"
      @added="onItemAdded"
    />
  </UContainer>
</template>
