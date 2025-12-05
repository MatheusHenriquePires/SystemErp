<template>
  <div class="flex h-screen bg-gray-100 dark:bg-[#121212] font-sans overflow-hidden">
    
    <aside class="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 hidden lg:flex">
      
      <div class="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-950">
         <svg class="w-6 h-6 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
         <span class="text-xl font-bold tracking-wider text-white">NetMark ERP</span>
      </div>

      <nav class="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
        
        <NuxtLink to="/" class="nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-r-md transition-all duration-200 text-gray-400 hover:bg-slate-800 hover:text-white">
          <svg class="w-5 h-5 mr-3 text-center group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          Dashboard
        </NuxtLink>

        <NuxtLink to="/pedidos" class="nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-r-md transition-all duration-200 text-gray-400 hover:bg-slate-800 hover:text-white">
          <svg class="w-5 h-5 mr-3 text-center group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          Pedidos (Orçamentos)
        </NuxtLink>

        <NuxtLink to="/produtos/importar" class="nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-r-md transition-all duration-200 text-gray-400 hover:bg-slate-800 hover:text-white">
          <svg class="w-5 h-5 mr-3 text-center group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          Importar Tabela
        </NuxtLink>

        <NuxtLink to="/clientes" class="nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-r-md transition-all duration-200 text-gray-400 hover:bg-slate-800 hover:text-white">
          <svg class="w-5 h-5 mr-3 text-center group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          Clientes
        </NuxtLink>

        <NuxtLink to="/produtos" class="nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-r-md transition-all duration-200 text-gray-400 hover:bg-slate-800 hover:text-white">
          <svg class="w-5 h-5 mr-3 text-center group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          Produtos
        </NuxtLink>

        <NuxtLink to="/financeiro" class="nav-item group flex items-center px-4 py-3 text-sm font-medium rounded-r-md transition-all duration-200 text-gray-400 hover:bg-slate-800 hover:text-white">
          <svg class="w-5 h-5 mr-3 text-center group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Financeiro
        </NuxtLink>

      </nav>

      <div class="p-4 border-t border-slate-800">
        <button @click="logout" class="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors hover:bg-slate-800 rounded">
           <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
           Sair
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden relative">
      
      <header class="h-16 bg-white dark:bg-[#1E1E1E] shadow-sm flex items-center justify-between px-6 z-10 border-b border-gray-200 dark:border-gray-800">
        <button class="lg:hidden text-gray-500 hover:text-gray-700">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        <div class="hidden lg:block"></div>

        <div class="flex items-center space-x-4 ml-auto">
          <button @click="toggleTheme" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <ClientOnly>
              <span v-if="colorMode.value === 'dark'">💡</span>
              <span v-else>🌙</span>
            </ClientOnly>
          </button>

          <button class="p-2 text-gray-400 hover:text-gray-600 relative">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
             <span class="absolute top-1 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <div class="flex items-center space-x-3 border-l pl-4 border-gray-200 dark:border-gray-700">
             <img src="https://ui-avatars.com/api/?name=Admin+User&background=f97316&color=fff" alt="User" class="h-8 w-8 rounded-full shadow-sm">
             <div class="hidden md:block text-sm">
                <p class="font-bold text-gray-700 dark:text-gray-200 leading-none">Administrador</p>
                <p class="text-xs text-gray-400 mt-1">admin@netmark.com</p>
             </div>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-[#121212]">
         <slot />
      </div>

    </main>
  </div>
</template>

<script setup>
const colorMode = useColorMode();
const cookie = useCookie('usuario_sessao'); 

function toggleTheme() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
}

function logout() {
    cookie.value = null;
    window.location.href = '/login';
}
</script>

<style scoped>
/* Estilo para o link ativo */
.router-link-active {
  background-color: rgba(255, 255, 255, 0.1); 
  border-left: 4px solid #f97316; 
  color: white !important;
}

.router-link-active svg {
  color: #f97316; 
}
</style>