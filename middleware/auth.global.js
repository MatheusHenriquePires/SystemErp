// middleware/auth.global.js
export default defineNuxtRouteMiddleware((to, from) => {
  const cookieSessao = useCookie('usuario_sessao')

  // Se já está logado e tenta ir pro login -> Dashboard
  if (to.path === '/login' && cookieSessao.value) {
    return navigateTo('/')
  }

  // Se NÃO está logado e tenta ir pro dashboard -> Login
  if (to.path !== '/login' && !cookieSessao.value) {
    return navigateTo('/login')
  }
})