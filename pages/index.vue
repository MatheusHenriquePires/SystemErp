<template>
  <DashboardLayout>
    <div class="p-8">
      
      <header class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Painel de Controle</h1>
          <p class="text-slate-500">Bem-vindo ao NetMark ERP. O que você quer fazer hoje?</p>
        </div>
        <div class="text-right hidden md:block">
          <p class="text-sm font-bold text-slate-600">Hoje</p>
          <p class="text-slate-500">{{ new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <NuxtLink to="/quotes" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition group cursor-pointer flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <span class="text-2xl">📄</span>
          </div>
          <h3 class="font-bold text-slate-800">Orçamentos</h3>
          <p class="text-xs text-slate-500 mt-1">Criar e gerenciar propostas</p>
        </NuxtLink>

        <NuxtLink to="/vendas" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition group cursor-pointer flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <span class="text-2xl">🛒</span>
          </div>
          <h3 class="font-bold text-slate-800">Vendas</h3>
          <p class="text-xs text-slate-500 mt-1">Consultar histórico de vendas</p>
        </NuxtLink>

        <NuxtLink to="/clientes" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition group cursor-pointer flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <span class="text-2xl">👥</span>
          </div>
          <h3 class="font-bold text-slate-800">Clientes</h3>
          <p class="text-xs text-slate-500 mt-1">Base de contatos e CRM</p>
        </NuxtLink>

        <NuxtLink to="/produtos" class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-400 transition group cursor-pointer flex flex-col items-center text-center">
          <div class="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <span class="text-2xl">📦</span>
          </div>
          <h3 class="font-bold text-slate-800">Produtos</h3>
          <p class="text-xs text-slate-500 mt-1">Estoque e Preços</p>
        </NuxtLink>

      </div>

      <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span class="w-2 h-6 bg-blue-600 rounded-full"></span>
        Resumo Financeiro
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-sm text-slate-500 mb-1">Saldo Geral</p>
          <h3 class="text-3xl font-bold text-slate-800">
            R$ {{ Number(dados?.kpis?.saldo_atual || 0).toFixed(2) }}
          </h3>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p class="text-sm text-slate-500 mb-1">Entradas (Total)</p>
           <h3 class="text-2xl font-bold text-emerald-600">
             + R$ {{ Number(dados?.kpis?.receitas || 0).toFixed(2) }}
           </h3>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p class="text-sm text-slate-500 mb-1">Saídas (Total)</p>
           <h3 class="text-2xl font-bold text-rose-600">
             - R$ {{ Math.abs(Number(dados?.kpis?.despesas || 0)).toFixed(2) }}
           </h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4">Fluxo de Caixa</h3>
          <ClientOnly>
            <apexchart type="area" height="250" :options="chartOptions" :series="series"></apexchart>
          </ClientOnly>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-100 font-bold bg-slate-50">
            Últimas Movimentações
          </div>
          <div class="flex-1 overflow-y-auto max-h-[250px]">
            <table class="w-full text-left text-sm">
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, index) in dados?.lista" :key="index" class="hover:bg-slate-50">
                  <td class="px-6 py-3">
                    <p class="font-medium text-slate-800">{{ item.descricao }}</p>
                    <p class="text-xs text-slate-500">{{ new Date(item.data).toLocaleDateString() }}</p>
                  </td>
                  <td class="px-6 py-3 text-right font-bold" :class="item.valor < 0 ? 'text-rose-600' : 'text-emerald-600'">
                    R$ {{ Math.abs(item.valor).toFixed(2) }}
                  </td>
                </tr>
                <tr v-if="!dados?.lista?.length">
                  <td class="p-6 text-center text-slate-400">Nada registrado ainda.</td>
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
  xaxis: { categories: dados.value?.grafico?.map(item => item.mes) || [] },
  colors: ['#10b981', '#f43f5e'],
  fill: { opacity: 0.1 }
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
</script>