export default defineEventHandler(() => {
  const db = useDb()
  return db.prepare('SELECT * FROM wish_items ORDER BY created_at DESC').all()
})
