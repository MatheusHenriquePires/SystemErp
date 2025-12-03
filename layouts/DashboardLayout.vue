<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-gray-900 font-sans text-slate-900 dark:text-gray-200">
    
    <aside class="w-64 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 hidden md:flex flex-col">
      <div class="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-gray-700">
        <img src="/logo.png" alt="Logo NetMark" class="h-10 w-auto object-contain" />
        <span class="font-bold text-xl tracking-tight text-blue-900 dark:text-blue-400">System ERP</span>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Gestão</p>
        
        <NuxtLink to="/" class="px-3 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">📊</span> Dashboard
        </NuxtLink>

        <NuxtLink to="/pedidos" class="px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">🧾</span> Pedidos (Orçamentos/Vendas)
        </NuxtLink>

        <NuxtLink to="/produtos/importar" class="px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">📥</span> Importar Tabela
        </NuxtLink>

        <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Cadastros</p>

        <NuxtLink to="/clientes" class="px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">👥</span> Clientes
        </NuxtLink>
        
        <NuxtLink to="/produtos" class="px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">📦</span> Produtos
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-200 dark:border-gray-700">
        <button @click="logout" class="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 w-full px-3 py-2 rounded-md transition font-medium text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Sair do Sistema
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
        <header class="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 p-4 shadow-sm flex items-center justify-end">
            
            <button @click="toggleTheme" class="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <span v-if="colorMode.value === 'dark'">💡</span>
                <span v-else>🌙</span>
            </button>
            
            <div class="flex items-center gap-3 ml-4">
                <slot name="header-actions" />
            </div>
        </header>

        <div class="p-8">
            <slot /> 
        </div>
    </main>
  </div>
</template>

<script setup>
// Lógica do Nuxt para Modo de Cor
const colorMode = useColorMode(); 

function toggleTheme() {
    // Muda a preferência e o Nuxt aplica a classe 'dark' no <html>
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
}

// Lógica de Logout
const cookie = useCookie('usuario_sessao'); 
function logout() {
    cookie.value = null; // Apaga o cookie
    window.location.href = '/login'; // Redireciona
    
}
</script>