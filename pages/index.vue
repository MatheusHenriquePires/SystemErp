<template>
  <DashboardLayout>
    <div class="p-8">
      
      <header class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold text-slate-800 dark:text-gray-100">Painel de Controle</h1>
          <p class="text-slate-500 dark:text-gray-400">Bem-vindo ao NetMark ERP. O que você quer fazer hoje?</p>
        </div>
        <div class="text-right hidden md:block">
          <p class="text-sm font-bold text-slate-600 dark:text-gray-300">Hoje</p>
          <p class="text-slate-500 dark:text-gray-400">{{ new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <NuxtLink to="/pedidos" class="card-access bg-white dark:bg-gray-800 hover:shadow-lg transition group cursor-pointer flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <span class="text-2xl">🧾</span>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-gray-200">Pedidos</h3>
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-1">Gerenciar propostas e histórico de vendas</p>
        </NuxtLink>

        <NuxtLink to="/produtos/importar" class="card-access bg-white dark:bg-gray-800 hover:shadow-lg transition group cursor-pointer flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <span class="text-2xl">📥</span>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-gray-200">Importar Tabela</h3>
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-1">Atualizar catálogo via PDF/Telegram</p>
        </NuxtLink>

        <NuxtLink to="/clientes" class="card-access bg-white dark:bg-gray-800 hover:shadow-lg transition group cursor-pointer flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <span class="text-2xl">👥</span>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-gray-200">Clientes</h3>
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-1">Base de contatos e CRM</p>
        </NuxtLink>

        <NuxtLink to="/produtos" class="card-access bg-white dark:bg-gray-800 hover:shadow-lg transition group cursor-pointer flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <span class="text-2xl">📦</span>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-gray-200">Produtos</h3>
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-1">Estoque e Preços</p>
        </NuxtLink>

      </div>

      <h2 class="text-lg font-bold text-slate-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <span class="w-2 h-6 bg-blue-600 rounded-full"></span>
        Resumo Financeiro
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
          <p class="text-sm text-slate-500 dark:text-gray-400 mb-1">Saldo Geral</p>
          <h3 class="text-3xl font-bold text-slate-800 dark:text-gray-100">
            R$ {{ Number(dados?.kpis?.saldo_atual || 0).toFixed(2) }}
          </h3>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
           <p class="text-sm text-slate-500 dark:text-gray-400 mb-1">Entradas (Total)</p>
           <h3 class="text-2xl font-bold text-emerald-600">
             + R$ {{ Number(dados?.kpis?.receitas || 0).toFixed(2) }}
           </h3>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
           <p class="text-sm text-slate-500 dark:text-gray-400 mb-1">Saídas (Total)</p>
           <h3 class="text-2xl font-bold text-rose-600">
             - R$ {{ Math.abs(Number(dados?.kpis?.despesas || 0)).toFixed(2) }}
           </h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm">
          <h3 class="font-bold text-slate-800 dark:text-gray-200 mb-4">Fluxo de Caixa</h3>
          <ClientOnly>
            <apexchart type="area" height="250" :options="chartOptions" :series="series"></apexchart>
          </ClientOnly>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-gray-700 font-bold bg-slate-50 dark:bg-gray-700 text-slate-800 dark:text-gray-200">
            Últimas Movimentações
          </div>
          <div class="flex-1 overflow-y-auto max-h-[250px]">
            <table class="w-full text-left text-sm">
              <tbody class="divide-y divide-slate-100 dark:divide-gray-700">
                <tr v-for="(item, index) in dados?.lista" :key="index" class="hover:bg-slate-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-3">
                    <p class="font-medium text-slate-800 dark:text-gray-300">{{ item.descricao }}</p>
                    <p class="text-xs text-slate-500 dark:text-gray-400">{{ new Date(item.data).toLocaleDateString() }}</p>
                  </td>
                  <td class="px-6 py-3 text-right font-bold" :class="item.valor < 0 ? 'text-rose-600' : 'text-emerald-600'">
                    R$ {{ Math.abs(item.valor).toFixed(2) }}
                  </td>
                </tr>
                <tr v-if="!dados?.lista?.length">
                  <td class="p-6 text-center text-slate-400 dark:text-gray-500">Nada registrado ainda.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';

// Busca dados Unificados da API (Vendas + Orçamentos + Despesas)
const { data: dados, refresh } = await useFetch('/api/dashboard')

// Config do Gráfico
const chartOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { 
    categories: dados.value?.grafico?.map(item => item.mes) || [],
    labels: { style: { colors: 'currentColor' } } // Adapta a cor do label
  },
  yaxis: {
    labels: { style: { colors: 'currentColor' } } // Adapta a cor do label
  },
  colors: ['#10b981', '#f43f5e'],
  fill: { opacity: 0.1 },
  tooltip: { theme: 'dark' } // Garante que o tooltip seja legível no modo escuro
}))

const series = computed(() => [
  { name: 'Receitas', data: dados.value?.grafico?.map(item => item.receita) || [] },
  { name: 'Despesas', data: dados.value?.grafico?.map(item => item.despesa) || [] }
])

const cookie = useCookie('usuario_sessao')
function logout() {
  cookie.value = null
  window.location.href = '/login'
}

onMounted(() => refresh());
</script>