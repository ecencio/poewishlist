// Redirige a / si el usuario ya está autenticado (páginas de login/register)
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (loggedIn.value) return navigateTo('/')
})
