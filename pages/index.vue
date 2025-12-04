<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
import { ref, onMounted } from 'vue';

// --- Lógica Mantida do seu arquivo original ---
const dados = ref({
  hoje: 0,
  orcamentos: 0,
  mes: 0,
  grafico: []
});
const loading = ref(true);
const maiorValorGrafico = ref(100);

async function carregarDashboard() {
  loading.value = true;
  try {
    const response = await $fetch('/api/dashboard');
    dados.value = response;
    
    if (response.grafico && response.grafico.length > 0) {
        const max = Math.max(...response.grafico.map(d => d.total));
        maiorValorGrafico.value = max > 0 ? max : 100;
    }
  } catch (e) {
    console.error("Erro ao carregar dashboard:", e);
    // Dados falsos de fallback para visualização se a API falhar (remova em produção se quiser)
    if(loading.value) {
        dados.value = { hoje: 1250.00, orcamentos: 5, mes: 45000.00, grafico: [] }
    }
  } finally {
    loading.value = false;
  }
}

function calcularAltura(valor) {
    if (maiorValorGrafico.value === 0) return 0;
    const percent = (valor / maiorValorGrafico.value) * 100;
    return valor > 0 && percent < 5 ? 5 : percent;
}

const formatarMoeda = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val || 0));

onMounted(() => {
  carregarDashboard();
});

useHead({ title: 'Dashboard - NetMark ERP' });
</script>

<template>
  <DashboardLayout>
    <div class="bg-gray-100 min-h-full p-6 font-sans">
      
      <!-- Cabeçalho da Página -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Visão Geral</h2>
        <p class="text-gray-500">Bem-vindo ao painel de controle do seu ERP.</p>
      </div>

      <!-- Grid de Stats (Cards Coloridos) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <!-- Card 1: Vendas Hoje (Verde) -->
        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-emerald-500 transition hover:shadow-md">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendas Hoje</p>
              <h3 class="text-2xl font-bold text-gray-800 mt-2">
                {{ loading ? '...' : formatarMoeda(dados.hoje) }}
              </h3>
            </div>
            <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
               <!-- Icon Dollar -->
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            <span class="text-emerald-500 font-medium">Hoje</span> vs ontem
          </div>
        </div>

        <!-- Card 2: Orçamentos (Laranja) -->
        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500 transition hover:shadow-md">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Orçamentos Abertos</p>
              <h3 class="text-2xl font-bold text-gray-800 mt-2">
                {{ loading ? '...' : dados.orcamentos }}
              </h3>
            </div>
            <div class="p-2 bg-orange-50 rounded-lg text-orange-600">
               <!-- Icon File -->
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            <span class="text-orange-500 font-medium">Pendentes</span> de aprovação
          </div>
        </div>

        <!-- Card 3: Faturamento (Azul) -->
        <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 transition hover:shadow-md">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Faturamento Mês</p>
              <h3 class="text-2xl font-bold text-gray-800 mt-2">
                {{ loading ? '...' : formatarMoeda(dados.mes) }}
              </h3>
            </div>
            <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
               <!-- Icon Chart -->
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            <span class="text-blue-500 font-medium">Acumulado</span> este mês
          </div>
        </div>

      </div>

      <!-- Seção Inferior: Gráfico e Ações -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Área do Gráfico -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-800">Desempenho (Últimos 7 dias)</h3>
            <button class="text-gray-400 hover:text-gray-600"><span class="text-2xl leading-none">...</span></button>
          </div>
          
          <div v-if="loading" class="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-400">
            <span class="animate-pulse">Carregando dados...</span>
          </div>
          
          <div v-else class="h-64 flex items-end justify-between space-x-3 px-2">
             <div v-if="!dados.grafico || dados.grafico.length === 0" class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-dashed border">
                Sem vendas no período.
             </div>

            <div v-for="(dia, index) in dados.grafico" :key="index" class="flex flex-col items-center flex-1 group h-full justify-end relative">
              <!-- Tooltip -->
              <div class="absolute -top-8 opacity-0 group-hover:opacity-100 transition text-xs font-bold bg-slate-800 text-white py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                {{ formatarMoeda(dia.total) }}
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-800 rotate-45"></div>
              </div>
              
              <!-- Barra -->
              <div 
                class="w-full max-w-[40px] bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all duration-500 relative"
                :style="{ height: `${calcularAltura(dia.total)}%` }"
              ></div>
              
              <!-- Label Dia -->
              <div class="mt-3 text-xs text-gray-500 font-medium uppercase">{{ dia.dia }}</div>
            </div>
          </div>
        </div>

        <!-- Acesso Rápido -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-6">Acesso Rápido</h3>
          <div class="space-y-4">
            
            <NuxtLink to="/pedidos/novo" class="block w-full">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-all group border border-gray-100 hover:border-orange-200 cursor-pointer">
                <span class="font-medium text-gray-700 group-hover:text-orange-700">Novo Orçamento</span>
                <div class="bg-white p-2 rounded-full shadow-sm text-gray-400 group-hover:text-orange-500 group-hover:shadow">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
              </div>
            </NuxtLink>
            
            <NuxtLink to="/pedidos" class="block w-full">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all group border border-gray-100 hover:border-blue-200 cursor-pointer">
                <span class="font-medium text-gray-700 group-hover:text-blue-700">Ver Pedidos</span>
                <div class="bg-white p-2 rounded-full shadow-sm text-gray-400 group-hover:text-blue-500 group-hover:shadow">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
              </div>
            </NuxtLink>

            <NuxtLink to="/clientes" class="block w-full">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all group border border-gray-100 hover:border-purple-200 cursor-pointer">
                <span class="font-medium text-gray-700 group-hover:text-purple-700">Gerenciar Clientes</span>
                <div class="bg-white p-2 rounded-full shadow-sm text-gray-400 group-hover:text-purple-500 group-hover:shadow">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
              </div>
            </NuxtLink>

          </div>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>