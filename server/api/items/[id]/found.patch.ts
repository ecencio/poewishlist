export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: 'ID de item inválido' })
  }

  const sql = useDb()

  const items = await sql`
    SELECT * FROM wish_items WHERE id = ${id}
  ` as { id: number, name: string, found_by_id: number | null }[]

  const item = items[0]

  if (!item) {
    throw createError({ statusCode: 404, message: 'Item no encontrado' })
  }

  let updated: Record<string, any>

  if (item.found_by_id) {
    // Desmarcar como encontrado
    const rows = await sql`
      UPDATE wish_items
      SET found_by_id = NULL, found_by_username = NULL, found_at = NULL
      WHERE id = ${id}
      RETURNING *
    ` as Record<string, any>[]
    updated = rows[0]
  }
  else {
    // Marcar como encontrado
    const rows = await sql`
      UPDATE wish_items
      SET found_by_id = ${session.user.id}, found_by_username = ${session.user.username}, found_at = now()
      WHERE id = ${id}
      RETURNING *
    ` as Record<string, any>[]
    updated = rows[0]

    await sendTelegramNotification(
      `<b><i>${item.name}</i></b> fue marcado como encontrado por ${session.user.username}`,
      'HTML')
  }

  return updated
})
