export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { poeItemId, name, icon, category, baseType, observation } = await readBody(event)

  if (!poeItemId || !name?.trim()) {
    throw createError({ statusCode: 400, message: 'Se requiere ID y nombre del item' })
  }

  const db = useDb()

  // Check if item already exists
  const [existing] = await db`SELECT id FROM wish_items WHERE poe_item_id = ${String(poeItemId)}`
  if (existing) {
    throw createError({ statusCode: 409, message: 'Este item ya está en la lista' })
  }

  // Insert item and return the created record using RETURNING *
  const [newItem] = await db`
    INSERT INTO wish_items
      (poe_item_id, name, icon, category, base_type, observation, added_by_id, added_by_username)
    VALUES (
      ${String(poeItemId)}, 
      ${name.trim()}, 
      ${icon ?? null}, 
      ${category ?? null}, 
      ${baseType ?? null}, 
      ${observation?.trim() || null}, 
      ${session.user.id}, 
      ${session.user.username}
    )
    RETURNING *
  `

  return newItem
})