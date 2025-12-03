<template>
  <div class="flex min-h-screen bg-slate-50 dark:bg-[#121212] font-sans text-slate-900 dark:text-gray-200">
    
    <aside class="w-64 bg-white dark:bg-[#1E1E1E] border-r border-slate-200 dark:border-gray-800 hidden md:flex flex-col">
      <div class="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-[#333]">
        <img src="/logo.png" alt="Logo NetMark" class="h-10 w-auto object-contain" />
        <span class="font-bold text-xl tracking-tight text-blue-900 dark:text-blue-400">System ERP</span>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <p class="px-3 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-2">Gestão</p>
        
        <NuxtLink to="/" class="px-3 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">📊</span> Dashboard
        </NuxtLink>

        <NuxtLink to="/pedidos" class="px-3 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#333] rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">🧾</span> Pedidos (Orçamentos/Vendas)
        </NuxtLink>
        </nav>
      </aside>

    <main class="flex-1 overflow-y-auto">
        <header class="sticky top-0 z-10 bg-white dark:bg-[#1E1E1E] border-b border-slate-200 dark:border-[#333] p-4 shadow-sm flex items-center justify-end">
            <button @click="toggleTheme" class="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] transition">
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
// Lógica do tema e logout permanece a mesma
const colorMode = useColorMode(); 
function toggleTheme() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
}
const cookie = useCookie('usuario_sessao'); 
function logout() {
    cookie.value = null;
    window.location.href = '/login';
}
</script>