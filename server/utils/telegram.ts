// Implementar logica para enviar notificaciones a Telegram cuando se reciba un nuevo pedido

// await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     chat_id: CHAT_ID,
//     text: "Nuevo pedido recibido",
//   }),
// });

// await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     chat_id: CHAT_ID,
//     text: `
// <b>🚀 Despliegue completado</b>

// <b>Proyecto:</b> API Gateway
// <b>Ambiente:</b> Producción
// <b>Estado:</b> ✅ Exitoso

// <i>Hora:</i> 15:30
// <code>commit: a1b2c3d</code>
// `,
//     parse_mode: "HTML",
//   }),
// });
import { env } from '~~/env'

const TOKEN = env.TELEGRAM_TOKEN
const CHAT_ID = env.TELEGRAM_CHAT_ID

export async function sendTelegramNotification(message: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  })
}
