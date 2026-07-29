export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Faltan campos obligatorios' })
  }

  if (password.length < 6) {
    throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 6 caracteres' })
  }

  const db = useDb()
  
  // 1. Check if user exists using Neon tagged template literal
  const existingUsers = await db`SELECT id FROM users WHERE username = ${username.trim()}`
  
  if (existingUsers.length > 0) {
    throw createError({ statusCode: 409, message: 'El nombre de usuario ya está en uso' })
  }

  const hashed = await hashPassword(password)

  // 2. Insert the new user
  await db`
    INSERT INTO users (username, password) 
    VALUES (${username.trim()}, ${hashed})
  `

  return { success: true }
})
