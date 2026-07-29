export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username?.trim() || !password) {
    throw createError({ statusCode: 400, message: 'Usuario y contraseña requeridos' })
  }

  const db = useDb()
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim()) as {
    id: number
    username: string
    password: string
  } | undefined

  if (!user || !(await verifyPassword(user.password, password))) {
    throw createError({ statusCode: 401, message: 'Usuario o contraseña incorrectos' })
  }

  await setUserSession(event, {
    user: { id: user.id, username: user.username }
  })

  return { success: true }
})
