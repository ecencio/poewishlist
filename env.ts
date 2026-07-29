import { createEnv } from '@t3-oss/env-nuxt'
import * as z from 'zod'

export const env = createEnv({
  server: {
    TELEGRAM_TOKEN: z.string().min(1),
    TELEGRAM_CHAT_ID: z.string().min(1)
  }
})
