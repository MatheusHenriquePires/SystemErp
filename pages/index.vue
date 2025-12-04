<template>
  <NuxtLayout name="dashboard-layout">
    <div class="p-8">
      
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-800">Visão Geral</h1>
        <p class="text-gray-500">Bem-vindo ao painel de controle do seu ERP.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start border-l-4 border-l-green-500">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vendas Hoje</p>
            <h3 class="text-2xl font-extrabold text-slate-800">{{ formatarMoeda(dashboard.vendas_hoje) }}</h3>
            <p class="text-xs text-green-600 mt-2 font-medium">
                {{ dashboard.vendas_hoje > 0 ? 'Parabéns pelas vendas!' : 'Vamos vender hoje?' }}
            </p>
          </div>
          <div class="p-3 bg-green-50 rounded-lg text-green-600">
            <span class="text-xl">💲</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start border-l-4 border-l-orange-500">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Orçamentos Abertos</p>
            <h3 class="text-2xl font-extrabold text-slate-800">{{ dashboard.orcamentos_abertos }}</h3>
            <p class="text-xs text-orange-600 mt-2 font-medium">Pendentes de aprovação</p>
          </div>
          <div class="p-3 bg-orange-50 rounded-lg text-orange-600">
            <span class="text-xl">📄</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start border-l-4 border-l-blue-500">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Faturamento Mês</p>
            <h3 class="text-2xl font-extrabold text-slate-800">{{ formatarMoeda(dashboard.faturamento_mes) }}</h3>
            <p class="text-xs text-blue-600 mt-2 font-medium">Acumulado este mês</p>
          </div>
          <div class="p-3 bg-blue-50 rounded-lg text-blue-600">
            <span class="text-xl">📈</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-slate-800">Desempenho (Últimos 7 dias)</h3>
          </div>
          
          <div class="h-64 flex items-end justify-between space-x-2 px-4 border-b border-gray-200 pb-2">
             <div v-if="dashboard.grafico.length === 0" class="w-full text-center text-gray-400 self-center">
                Sem dados de vendas nos últimos 7 dias.
             </div>

             <div v-for="(dia, index) in dashboard.grafico" :key="index" class="flex flex-col items-center flex-1 group">
                <div class="relative w-full flex justify-end flex-col items-center">
                    <span class="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded transition mb-1">
                        {{ formatarMoeda(dia.total) }}
                    </span>
                    <div 
                        class="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all duration-500"
                        :style="{ height: `${calcularAltura(dia.total)}px`, minHeight: '4px' }"
                    ></div>
                </div>
                <span class="text-xs text-gray-500 mt-2 font-medium">{{ dia.dia }}</span>
             </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 class="font-bold text-slate-800 mb-4">Acesso Rápido</h3>
          <div class="space-y-3">
            <NuxtLink to="/pedidos/novo" class="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg group transition cursor-pointer border border-transparent hover:border-gray-200">
              <span class="text-sm font-medium text-gray-700">Novo Orçamento</span>
              <span class="text-gray-400 group-hover:text-blue-600 text-lg">+</span>
            </NuxtLink>

            <NuxtLink to="/pedidos" class="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg group transition cursor-pointer border border-transparent hover:border-gray-200">
              <span class="text-sm font-medium text-gray-700">Ver Pedidos</span>
              <span class="text-gray-400 group-hover:text-blue-600 text-lg">📦</span>
            </NuxtLink>

            <button @click="emBreve" class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg group transition cursor-pointer border border-transparent hover:border-gray-200">
              <span class="text-sm font-medium text-gray-700">Gerenciar Clientes</span>
              <span class="text-gray-400 group-hover:text-blue-600 text-lg">👥</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const dashboard = ref({
    vendas_hoje: 0,
    faturamento_mes: 0,
    orcamentos_abertos: 0,
    grafico: [] as any[]
});

const carregarDados = async () => {
    try {
        const dados: any = await $fetch('/api/dashboard');
        dashboard.value = dados;
    } catch (e) {
        console.error("Erro ao carregar dashboard", e);
    }
};

// Altura máxima das barras do gráfico (para proporção)
const calcularAltura = (valor: number) => {
    const max = Math.max(...dashboard.value.grafico.map(d => Number(d.total)), 100);
    // Escala para caber em 200px de altura max
    return (Number(valor) / max) * 200;
};

const formatarMoeda = (val: any) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
};

const emBreve = () => alert('Funcionalidade em desenvolvimento!');

onMounted(carregarDados);
</script>