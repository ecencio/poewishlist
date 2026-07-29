export interface PoeSearchResult {
  id: string
  name: string
  baseType: string
  icon: string
  category: string
}

interface CompactItem {
  id: number
  name: string
  category?: string
  group?: string
  frame?: number
  icon?: string
}

// In-memory cache
let _items: PoeSearchResult[] = []
let _lastFetch = 0
const CACHE_TTL = 2 * 60 * 60 * 1000 // 2 hours
const LEAGUE = 'Allflame'

export async function searchPoeItems(query: string): Promise<PoeSearchResult[]> {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  try {
    const items = await getPoeWatchItems()
    return items.filter(item => item.name.toLowerCase().includes(q)).slice(0, 20)
  }
  catch (err) {
    console.warn('[poe-search] poe.watch failed:', err)
  }

  // Fallback: PoE wiki opensearch (name suggestions only)
  return searchPoeWiki(q)
}

async function getPoeWatchItems(): Promise<PoeSearchResult[]> {
  const now = Date.now()
  if (_items.length > 0 && now - _lastFetch < CACHE_TTL) {
    return _items
  }

  const encoded = encodeURIComponent(LEAGUE)
  const res = await fetch(`https://api.poe.watch/compact?league=${encoded}`, {
    signal: AbortSignal.timeout(30_000)
  })
  if (!res.ok) throw new Error(`poe.watch responded ${res.status}`)

  const data = (await res.json()) as { items: CompactItem[] }
  const rawItems = Array.isArray(data) ? data : data.items ?? []

  // Deduplicate by name (keep first occurrence)
  const seen = new Set<string>()
  _items = rawItems
    .filter((item) => {
      const key = item.name?.toLowerCase() ?? ''
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(item => ({
      id: `poewatch_${item.id}`,
      name: item.name ?? '',
      baseType: '',
      icon: item.icon ?? '',
      category: item.group ?? item.category ?? ''
    }))

  _lastFetch = now
  return _items
}

async function searchPoeWiki(query: string): Promise<PoeSearchResult[]> {
  const params = new URLSearchParams({
    action: 'cargoquery',
    tables: 'items',
    fields: 'items.name,items.inventory_icon,items.base_item',
    where: `items.name LIKE '%${query.replace(/'/g, "''")}%'`,
    limit: '20',
    format: 'json'
  })

  const res = await fetch(`https://www.poewiki.net/w/api.php?${params}`, {
    signal: AbortSignal.timeout(10_000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; poe-wishlist/1.0)',
      'Accept': 'application/json'
    }
  })
  if (!res.ok) throw new Error(`wiki responded ${res.status}`)

  const data = (await res.json()) as {
    cargoquery?: Array<{ title: Record<string, string> }>
  }

  return (data.cargoquery ?? [])
    .map((entry) => {
      const t = entry.title
      const iconFile = (t['inventory icon'] ?? t.inventory_icon ?? '').trim()
      const iconUrl = iconFile
        ? `https://www.poewiki.net/wiki/Special:FilePath/${encodeURIComponent(iconFile.replace(/ /g, '_'))}`
        : ''
      return {
        id: `wiki_${(t.name ?? '').replace(/ /g, '_')}`,
        name: t.name ?? '',
        baseType: t['base item'] ?? t.base_item ?? '',
        icon: iconUrl,
        category: ''
      }
    })
    .filter(item => item.name.length > 0)
}
