export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const { poeItemId, name, icon, category, baseType, observation } = await readBody(event)

  if (!poeItemId || !name?.trim()) {
    throw createError({ statusCode: 400, message: 'Se requiere ID y nombre del item' })
  }

  const db = useDb()

  const existing = db
    .prepare('SELECT id FROM wish_items WHERE poe_item_id = ?')
    .get(String(poeItemId))
  if (existing) {
    throw createError({ statusCode: 409, message: 'Este item ya está en la lista' })
  }

  const { lastInsertRowid } = db
    .prepare(`
      INSERT INTO wish_items
        (poe_item_id, name, icon, category, base_type, observation, added_by_id, added_by_username)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      String(poeItemId),
      name.trim(),
      icon ?? null,
      category ?? null,
      baseType ?? null,
      observation?.trim() || null,
      session.user.id,
      session.user.username
    )

  return db.prepare('SELECT * FROM wish_items WHERE id = ?').get(lastInsertRowid)
})
