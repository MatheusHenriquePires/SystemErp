export default defineNuxtRouteMiddleware((to, from) => {
    // 1. Lê o cookie de sessão
    // O Nuxt sincroniza isso automaticamente entre Server e Client
    const cookie = useCookie('usuario_sessao')
    
    // 2. Definimos as rotas PÚBLICAS (onde não precisa estar logado)
    const publicRoutes = ['/login', '/esqueci-senha']

    // Verifica se a rota atual é pública
    const isPublicRoute = publicRoutes.includes(to.path)

    // LOG PARA DEBUG (Abra o console do navegador F12 para ver isso)
    if (process.client) {
        console.log(`Rota: ${to.path} | Tem Cookie? ${!!cookie.value}`)
    }

    // CASO 1: Usuário NÃO tem cookie e tenta acessar rota PRIVADA
    // (Se não é pública e não tem cookie -> Manda pro Login)
    if (!isPublicRoute && !cookie.value) {
        return navigateTo('/login')
    }

    // CASO 2: Usuário TEM cookie e tenta acessar rota PÚBLICA (Login)
    // (Já está logado, não precisa ver tela de login -> Manda pra Home)
    if (isPublicRoute && cookie.value) {
        return navigateTo('/')
    }
})