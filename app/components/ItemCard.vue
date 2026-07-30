<script setup lang="ts">
interface WishItem {
  id: number
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

const props = defineProps<{
  item: WishItem
  toggling?: boolean
  deleting?: boolean
}>()

const emit = defineEmits<{
  'toggle-found': []
  'delete': []
}>()

const { user, loggedIn } = useUserSession()

const iconError = ref(false)
const confirmDelete = ref(false)

const isOwner = computed(() => loggedIn.value && user.value?.id === props.item.added_by_id)

const foundLabel = computed(() =>
  props.item.found_by_id ? `${props.item.found_by_username}` : 'Sin encontrar'
)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-UY', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}
</script>

<template>
  <UCard
    class="flex flex-col h-full transition-shadow hover:shadow-md"
    :class="item.found_by_id ? 'opacity-75' : ''"
  >
    <!-- Item header: icon + name + delete -->
    <div class="flex gap-3 items-start">
      <div class="w-14 h-14 shrink-0 flex items-center justify-center rounded bg-neutral-100 dark:bg-neutral-500 overflow-hidden">
        <UPopover mode="hover" enable-touch>
          <img
            v-if="item.icon && !iconError"
            :src="item.icon"
            :alt="item.name"
            class="w-12 h-12 object-contain"
            loading="lazy"
            @error="iconError = true"
          >
          <UIcon v-else name="i-lucide-gem" class="w-8 h-8 text-muted" />
          <template #content>
            <div class="bg-neutral-100 dark:bg-neutral-500 rounded">
              <img
                v-if="item.icon && !iconError"
                :src="item.icon"
                :alt="item.name"
                class="object-contain p-2"
                loading="lazy"
                @error="iconError = true"
              >
            </div>
          </template>
        </UPopover>
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-semibold leading-tight truncate" :title="item.name">
          {{ item.name }}
        </h3>
        <p v-if="item.base_type" class="text-xs text-muted truncate">
          {{ item.base_type }}
        </p>
        <UBadge
          v-if="item.category"
          :label="item.category"
          variant="subtle"
          size="xs"
          class="mt-1 capitalize"
        />
      </div>

      <!-- Delete button (owner only) -->
      <div v-if="isOwner" class="shrink-0">
        <UButton
          v-if="!confirmDelete"
          icon="i-lucide-trash-2"
          variant="ghost"
          color="neutral"
          size="xs"
          :loading="deleting"
          @click="confirmDelete = true"
        />
        <div v-else class="flex items-center gap-1">
          <UButton
            icon="i-lucide-check"
            variant="solid"
            color="error"
            size="xs"
            :loading="deleting"
            @click="emit('delete'); confirmDelete = false"
          />
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="confirmDelete = false"
          />
        </div>
      </div>
    </div>

    <!-- Observation -->
    <p
      v-if="item.observation"
      class="mt-3 text-sm text-muted italic border-l-2 border-primary/40 pl-2"
    >
      "{{ item.observation }}"
    </p>

    <!-- Footer: metadata + action -->
    <div class="mt-4 pt-3 border-t border-muted/20 flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs text-muted gap-2">
        <span class="flex items-center gap-1 truncate">
          <UIcon name="i-lucide-user" class="w-3 h-3 shrink-0" />
          {{ item.added_by_username }}
        </span>
        <span class="shrink-0">{{ formatDate(item.created_at) }}</span>
      </div>

      <div class="flex items-center justify-between gap-2">
        <UBadge
          :color="item.found_by_id ? 'success' : 'neutral'"
          :variant="item.found_by_id ? 'solid' : 'subtle'"
          :icon="item.found_by_id ? 'i-lucide-check-circle' : 'i-lucide-circle'"
          size="sm"
          class="truncate max-w-[160px]"
          :label="item.found_by_id ? `✓ ${foundLabel}` : 'Sin encontrar'"
        />

        <UButton
          v-if="loggedIn"
          :loading="toggling"
          :color="item.found_by_id ? 'neutral' : 'primary'"
          :variant="item.found_by_id ? 'outline' : 'solid'"
          size="xs"
          :icon="item.found_by_id ? 'i-lucide-search-x' : 'i-lucide-search-check'"
          @click="emit('toggle-found')"
        >
          {{ item.found_by_id ? 'Desmarcar' : 'Encontrado' }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
