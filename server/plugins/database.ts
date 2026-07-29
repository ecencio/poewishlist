import { initSchema } from '~~/server/utils/db' // Adjust the import path to wherever your initSchema lives

export default defineNitroPlugin(async () => {
  try {
    await initSchema()
    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database schema:', error)
  }
})