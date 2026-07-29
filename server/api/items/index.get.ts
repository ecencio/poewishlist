export default defineEventHandler(async () => {
  const db = useDb()
  const items = await db`SELECT * FROM wish_items ORDER BY created_at DESC`
  return items
})