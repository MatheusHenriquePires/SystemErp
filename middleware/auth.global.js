// middleware/auth.global.ts

// Esta função será executada em TODAS as rotas
export default defineNuxtRouteMiddleware((to, from) => {
    // 1. Onde está a sessão? (Lê o cookie)
    const cookie = useCookie('usuario_sessao');
    const isAuthenticated = !!cookie.value; // Verifica se o cookie tem algum valor

    // Define as rotas que são protegidas
    const protectedRoutes = ['/', '/pedidos', '/produtos', '/clientes', '/produtos/importar'];

    // 2. Se a rota atual é protegida E o usuário NÃO está autenticado
    if (protectedRoutes.includes(to.path) && !isAuthenticated) {
        
        // Se a rota for a home ('/'), verificamos se o usuário está tentando acessar o dashboard
        if (to.path === '/') {
             return navigateTo('/login');
        }
        
        // Redireciona para o login
        return navigateTo('/login'); 
    }

    // 3. Se o usuário tentar acessar o /login mas já estiver logado, joga para o dashboard
    if (to.path === '/login' && isAuthenticated) {
        return navigateTo('/');
    }
});