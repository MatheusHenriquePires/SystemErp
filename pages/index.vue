<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">
      
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">📊 Visão Geral</h1>
        <p class="text-slate-500">Bem-vindo ao painel de controle do seu ERP.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-white p-6 rounded-xl shadow border border-slate-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Vendas Hoje</p>
            <h3 class="text-2xl font-bold text-emerald-600 mt-1">
              {{ loading ? '...' : formatarMoeda(dados.hoje) }}
            </h3>
          </div>
          <div class="bg-emerald-100 p-3 rounded-full text-emerald-600">
            💰
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow border border-slate-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Orçamentos Abertos</p>
            <h3 class="text-2xl font-bold text-amber-600 mt-1">
              {{ loading ? '...' : dados.orcamentos }}
            </h3>
          </div>
          <div class="bg-amber-100 p-3 rounded-full text-amber-600">
            📝
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow border border-slate-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Faturamento Mês</p>
            <h3 class="text-2xl font-bold text-blue-600 mt-1">
              {{ loading ? '...' : formatarMoeda(dados.mes) }}
            </h3>
          </div>
          <div class="bg-blue-100 p-3 rounded-full text-blue-600">
            📅
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-slate-100">
          <h3 class="text-lg font-bold text-slate-700 mb-6">Desempenho (Últimos 7 dias)</h3>
          
          <div v-if="loading" class="h-64 flex items-center justify-center text-slate-400">
            Carregando gráfico...
          </div>
          
          <div v-else class="h-64 flex items-end justify-between space-x-2">
            <div v-if="dados.grafico.length === 0" class="w-full text-center text-gray-400">
                Sem vendas nos últimos 7 dias.
             </div>

            <div v-for="(dia, index) in dados.grafico" :key="index" class="flex flex-col items-center flex-1 group">
              
              <div class="mb-2 opacity-0 group-hover:opacity-100 transition text-xs bg-slate-800 text-white py-1 px-2 rounded -translate-y-1">
                {{ formatarMoeda(dia.total) }}
              </div>
              
              <div 
                class="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all duration-500"
                :style="{ height: `${calcularAltura(dia.total)}%` }"
              ></div>
              
              <div class="mt-2 text-xs text-slate-500 font-medium">{{ dia.dia }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h3 class="text-lg font-bold text-slate-700 mb-4">Acesso Rápido</h3>
          <div class="space-y-3">
            <NuxtLink to="/pedidos/novo" class="flex items-center p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition group">
              <span class="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 group-hover:bg-blue-200">+</span>
              <span class="text-slate-700 font-medium group-hover:text-blue-700">Novo Orçamento</span>
            </NuxtLink>
            
            <NuxtLink to="/pedidos" class="flex items-center p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg transition group">
              <span class="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-3 group-hover:bg-emerald-200">📦</span>
              <span class="text-slate-700 font-medium group-hover:text-emerald-700">Ver Pedidos</span>
            </NuxtLink>

            <NuxtLink to="/clientes" class="flex items-center p-3 bg-slate-50 hover:bg-purple-50 rounded-lg transition group">
              <span class="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3 group-hover:bg-purple-200">👥</span>
              <span class="text-slate-700 font-medium group-hover:text-purple-700">Gerenciar Clientes</span>
            </NuxtLink>
          </div>
        </div>

      </div>

    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';

const dados = ref({
  hoje: 0,
  orcamentos: 0,
  mes: 0,
  grafico: []
});
const loading = ref(true);
const maiorValorGrafico = ref(100); // Para calcular a escala das barras

// Função para buscar dados do backend
async function carregarDashboard() {
  loading.value = true;
  try {
    const response = await $fetch('/api/dashboard');
    dados.value = response;
    
    // Calcula qual é o maior valor para definir a altura de 100% do gráfico
    if (response.grafico.length > 0) {
        const max = Math.max(...response.grafico.map(d => d.total));
        maiorValorGrafico.value = max > 0 ? max : 100;
    }
  } catch (e) {
    console.error("Erro ao carregar dashboard:", e);
  } finally {
    loading.value = false;
  }
}

// Calcula a altura da barra em porcentagem (regra de 3)
function calcularAltura(valor) {
    if (maiorValorGrafico.value === 0) return 0;
    // Deixa pelo menos 5% de altura se o valor for > 0 para a barra aparecer
    const percent = (valor / maiorValorGrafico.value) * 100;
    return valor > 0 && percent < 5 ? 5 : percent;
}

const formatarMoeda = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

onMounted(() => {
  carregarDashboard();
});

useHead({ title: 'Dashboard - NetMark ERP' });
</script>