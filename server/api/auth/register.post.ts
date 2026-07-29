export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username?.trim() || !password) {
    throw createError({ statusCode: 400, message: 'Usuario y contraseña requeridos' })
  }
  if (username.trim().length < 3 || username.trim().length > 30) {
    throw createError({ statusCode: 400, message: 'El usuario debe tener entre 3 y 30 caracteres' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 6 caracteres' })
  }

  const db = useDb()
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim())
  if (existing) {
    throw createError({ statusCode: 409, message: 'El nombre de usuario ya está en uso' })
  }

  const hashed = await hashPassword(password)
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    .run(username.trim(), hashed)

  await setUserSession(event, {
    user: { id: Number(lastInsertRowid), username: username.trim() }
  })

  return { success: true }
})
