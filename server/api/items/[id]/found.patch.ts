export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: 'ID de item inválido' })
  }

  const db = useDb()
  const item = db.prepare('SELECT * FROM wish_items WHERE id = ?').get(id) as {
    id: number
    found_by_id: number | null
  } | undefined

  if (!item) {
    throw createError({ statusCode: 404, message: 'Item no encontrado' })
  }

  if (item.found_by_id) {
    // Desmarcar como encontrado
    db.prepare('UPDATE wish_items SET found_by_id = NULL, found_by_username = NULL, found_at = NULL WHERE id = ?').run(id)
  }
  else {
    // Marcar como encontrado
    db.prepare(`
      UPDATE wish_items
      SET found_by_id = ?, found_by_username = ?, found_at = datetime('now')
      WHERE id = ?
    `).run(session.user.id, session.user.username, id)
  }

  return db.prepare('SELECT * FROM wish_items WHERE id = ?').get(id)
})
