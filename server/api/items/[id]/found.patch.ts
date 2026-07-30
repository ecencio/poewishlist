export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: 'ID de item inválido' })
  }

  const db = useDb()

  // Fetch the item
  const [item] = await db`SELECT * FROM wish_items WHERE id = ${id}` as Array<{
    id: number
    added_by_id: number
  }>

  if (!item) {
    throw createError({ statusCode: 404, message: 'Item no encontrado' })
  }

  if (item.added_by_id !== session.user.id) {
    throw createError({ statusCode: 403, message: 'Solo quien agregó el item puede eliminarlo' })
  }

  // Delete the item
  await db`DELETE FROM wish_items WHERE id = ${id}`

  return { success: true }
})
