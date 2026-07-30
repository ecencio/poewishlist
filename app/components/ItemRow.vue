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

function formatDate(dateStr: string) {
  return new Date(dateStr + 'Z').toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3 border-b border-[var(--ui-border-muted)] last:border-0 transition-colors hover:bg-[var(--ui-bg-elevated)]"
    :class="item.found_by_id ? 'opacity-60' : ''"
  >
    <!-- Icon -->
    <div class="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
      <UPopover mode="hover" enable-touch>
        <img
          v-if="item.icon && !iconError"
          :src="item.icon"
          :alt="item.name"
          class="w-9 h-9 object-contain"
          loading="lazy"
          @error="iconError = true"
        >
        <UIcon v-else name="i-lucide-gem" class="w-5 h-5 text-muted" />
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

    <!-- Name + meta -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class="font-semibold text-sm truncate"
          :class="item.found_by_id ? 'line-through text-muted' : ''"
        >{{ item.name }}</span>
        <UBadge
          v-if="item.category"
          :label="item.category"
          variant="subtle"
          size="xs"
          class="capitalize shrink-0"
        />
      </div>
      <div class="flex items-center gap-3 mt-0.5 text-xs text-muted flex-wrap">
        <span v-if="item.base_type">{{ item.base_type }}</span>
        <span class="flex items-center gap-1 shrink-0">
          <UIcon name="i-lucide-user" class="w-3 h-3" />
          {{ item.added_by_username }}
        </span>
        <span v-if="item.observation" class="italic truncate max-w-xs">
          "{{ item.observation }}"
        </span>
        <span v-if="item.found_by_id" class="flex items-center gap-1 text-green-600 dark:text-green-400 shrink-0">
          <UIcon name="i-lucide-check-circle" class="w-3 h-3" />
          {{ item.found_by_username }} · {{ formatDate(item.found_at!) }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1 shrink-0">
      <UButton
        v-if="loggedIn"
        :loading="toggling"
        :color="item.found_by_id ? 'neutral' : 'primary'"
        :variant="item.found_by_id ? 'outline' : 'solid'"
        size="xs"
        :icon="item.found_by_id ? 'i-lucide-x' : 'i-lucide-check'"
        @click="emit('toggle-found')"
      />

      <template v-if="isOwner">
        <UButton
          v-if="!confirmDelete"
          icon="i-lucide-trash-2"
          variant="ghost"
          color="neutral"
          size="xs"
          :loading="deleting"
          @click="confirmDelete = true"
        />
        <template v-else>
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
        </template>
      </template>
    </div>
  </div>
</template>
