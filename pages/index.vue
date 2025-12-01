<template>
  <div class="flex min-h-screen bg-slate-50 font-sans text-slate-900">
    
  <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div class="p-6 flex items-center gap-2 border-b border-slate-100">
        <div class="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
        <span class="font-bold text-xl tracking-tight text-blue-900">Sistema ERP</span>
      </div>
      
      <nav class="flex-1 p-4 space-y-1">
        <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Gestão</p>
        
        <div class="px-3 py-2 text-orange-600 bg-blue-50 rounded-md font-medium cursor-pointer flex items-center gap-3">
          <span class="text-lg">📊</span> Dashboard
        </div>
        
        <div class="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">💰</span> Financeiro
        </div>

        <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Cadastros</p>

        <NuxtLink to="/clientes" class="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">👥</span> Clientes
        </NuxtLink>

        <NuxtLink to="/produtos" class="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">📦</span> Produtos
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-100">
        <button @click="logout" class="flex items-center gap-2 text-red-600 hover:bg-red-50 w-full px-3 py-2 rounded-md transition font-medium text-sm">
          Sair do Sistema
        </button>
      </div>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Visão Geral</h1>
          <p class="text-slate-500">Bem-vindo ao sistema da sua empresa.</p>
        </div>
        <button @click="abrirModal" class="bg-orange-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2">
          <span>+</span> Novo Lançamento
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p class="text-sm text-slate-500 mb-1">Saldo em Caixa</p>
          <h3 class="text-3xl font-bold text-slate-800">
            R$ {{ Number(dados?.kpis?.saldo_atual || 0).toFixed(2) }}
          </h3>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p class="text-sm text-slate-500 mb-1">Receitas</p>
           <h3 class="text-2xl font-bold text-emerald-600">
             + R$ {{ Number(dados?.kpis?.receitas || 0).toFixed(2) }}
           </h3>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p class="text-sm text-slate-500 mb-1">Despesas</p>
           <h3 class="text-2xl font-bold text-rose-600">
             - R$ {{ Math.abs(Number(dados?.kpis?.despesas || 0)).toFixed(2) }}
           </h3>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 class="font-bold text-slate-800 mb-4">Fluxo de Caixa (Últimos 6 Meses)</h3>
        <ClientOnly>
          <apexchart 
            type="area" 
            height="300" 
            :options="chartOptions" 
            :series="series"
          ></apexchart>
        </ClientOnly>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 font-bold">Últimos Lançamentos</div>
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500">
            <tr>
              <th class="px-6 py-3">Descrição</th>
              <th class="px-6 py-3">Data</th>
              <th class="px-6 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(item, index) in dados?.lista" :key="index">
              <td class="px-6 py-4 font-medium">{{ item.descricao }}</td>
              <td class="px-6 py-4 text-slate-500">{{ new Date(item.data).toLocaleDateString() }}</td>
              <td class="px-6 py-4 text-right font-bold" :class="item.valor < 0 ? 'text-rose-600' : 'text-emerald-600'">
                R$ {{ Math.abs(item.valor).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl shadow-xl w-96">
          <h2 class="text-xl font-bold mb-4">Novo Lançamento</h2>
          <form @submit.prevent="salvarLancamento">
            <div class="flex gap-4 mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.tipo" value="receita" class="text-emerald-600">
                <span>Receita</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.tipo" value="despesa" class="text-rose-600">
                <span>Despesa</span>
              </label>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Descrição</label>
              <input v-model="form.descricao" type="text" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" required />
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium mb-1">Valor (R$)</label>
              <input v-model="form.valor" type="number" step="0.01" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" required />
            </div>
            <div class="flex gap-2 justify-end">
              <button type="button" @click="mostrarModal = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
              <button type="submit" class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-blue-700 font-medium">Salvar</button>
            </div>
          </form>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
// Busca dados da API
const { data: dados, pending, refresh } = await useFetch('/api/dashboard')

// --- LÓGICA DO GRÁFICO INTELIGENTE ---
// O "computed" fica vigiando os dados. Se o banco mudar, o gráfico muda sozinho.
const chartOptions = computed(() => {
  return {
    chart: { type: 'area', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    xaxis: { 
      // Pega os meses que vieram do banco (Ex: ['Nov', 'Dez'])
      // Se não tiver dados, mostra um array vazio
      categories: dados.value?.grafico?.map(item => item.mes) || []
    },
    colors: ['#10b981', '#f43f5e'], // Verde e Vermelho
  }
})

const series = computed(() => {
  return [
    { 
      name: 'Receitas', 
      // Pega só os valores de receita
      data: dados.value?.grafico?.map(item => item.receita) || [] 
    },
    { 
      name: 'Despesas', 
      // Pega só os valores de despesa
      data: dados.value?.grafico?.map(item => item.despesa) || [] 
    }
  ]
})

// --- MODAL & LÓGICA DE SISTEMA ---
const mostrarModal = ref(false)
const salvando = ref(false)
const form = ref({ descricao: '', valor: '', tipo: 'despesa' })

function abrirModal() {
  form.value = { descricao: '', valor: '', tipo: 'despesa' }
  mostrarModal.value = true
}

async function salvarLancamento() {
  salvando.value = true
  try {
    await $fetch('/api/novo-lancamento', { method: 'POST', body: form.value })
    mostrarModal.value = false
    refresh() // Atualiza KPIs, Lista e GRÁFICO ao mesmo tempo!
  } catch (e) { alert('Erro ao salvar') }
  finally { salvando.value = false }
}

const cookie = useCookie('usuario_sessao')
function logout() {
  cookie.value = null
  window.location.href = '/login'
}
</script>