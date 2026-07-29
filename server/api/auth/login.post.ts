export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  if (!username?.trim() || !password) {
    throw createError({ statusCode: 400, message: 'Usuario y contraseña requeridos' })
  }

  const db = useDb()
  
  // Use array destructuring to grab the first user result from Neon's returned array
  const [user] = await db`
    SELECT * FROM users WHERE username = ${username.trim()}
  ` as Array<{
    id: number
    username: string
    password: string
  }>

  if (!user || !(await verifyPassword(user.password, password))) {
    throw createError({ statusCode: 401, message: 'Usuario o contraseña incorrectos' })
  }

  await setUserSession(event, {
    user: { id: user.id, username: user.username }
  })

  return { success: true }
})