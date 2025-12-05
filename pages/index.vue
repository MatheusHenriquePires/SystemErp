<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-8">
      
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">👋 Olá, Equipe!</h1>
          <p class="text-gray-500 mt-1">Visão geral do seu negócio hoje.</p>
        </div>
        
        <NuxtLink to="/pedidos/novo" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow transition flex items-center gap-2">
          <span>+</span> Nova Venda
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Recebido este Mês</p>
            <h2 class="text-3xl font-bold text-green-700">{{ formatarMoeda(stats.faturamento) }}</h2>
          </div>
          <div class="p-3 bg-green-50 rounded-full">
            <span class="text-2xl">💰</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-yellow-400">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total a Receber</p>
            <h2 class="text-3xl font-bold text-yellow-600">{{ formatarMoeda(stats.pendentes) }}</h2>
          </div>
          <div class="p-3 bg-yellow-50 rounded-full">
            <span class="text-2xl">⏳</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Alerta de Estoque</p>
            <h2 class="text-3xl font-bold" :class="stats.baixoEstoque > 0 ? 'text-red-600' : 'text-gray-900'">
              {{ stats.baixoEstoque }}
            </h2>
            <p v-if="stats.baixoEstoque > 0" class="text-xs text-red-500 mt-1">Produtos acabando!</p>
          </div>
          <div class="p-3 bg-red-50 rounded-full">
            <span class="text-2xl">📦</span>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="font-bold text-gray-800">Últimos Pedidos</h3>
            <NuxtLink to="/pedidos" class="text-sm text-blue-600 hover:text-blue-800 font-medium">Ver todos &rarr;</NuxtLink>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th class="px-6 py-3">ID</th>
                  <th class="px-6 py-3">Cliente</th>
                  <th class="px-6 py-3">Valor Total</th>
                  <th class="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="pedido in stats.recentes" :key="pedido.id" class="hover:bg-gray-50">
                  <td class="px-6 py-3 font-mono text-gray-500">#{{ pedido.id }}</td>
                  <td class="px-6 py-3 font-medium text-gray-900">{{ pedido.cliente_nome }}</td>
                  <td class="px-6 py-3 font-bold">{{ formatarMoeda(pedido.valor_total) }}</td>
                  <td class="px-6 py-3">
                    <span :class="`px-2 py-1 rounded-full text-xs font-bold ${getCorStatus(pedido.status)}`">
                      {{ pedido.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="stats.recentes.length === 0">
                  <td colspan="4" class="px-6 py-8 text-center text-gray-400">Nenhuma venda recente.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h3 class="font-bold text-gray-800 mb-4">Acesso Rápido</h3>
          <div class="space-y-3">
            
            <NuxtLink to="/produtos" class="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition group">
              <span class="bg-white p-2 rounded shadow-sm mr-3 group-hover:scale-110 transition text-lg">📦</span>
              <div>
                <span class="font-bold block">Gerenciar Estoque</span>
                <span class="text-xs text-gray-500">Ver produtos e preços</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/admin/usuarios" class="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition group">
              <span class="bg-white p-2 rounded shadow-sm mr-3 group-hover:scale-110 transition text-lg">👥</span>
              <div>
                <span class="font-bold block">Minha Equipe</span>
                <span class="text-xs text-gray-500">Adicionar vendedores</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/financeiro" class="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-green-50 hover:text-green-700 transition group">
              <span class="bg-white p-2 rounded shadow-sm mr-3 text-lg">💰</span>
              <div>
                <span class="font-bold block">Contas a Receber</span>
                <span class="text-xs text-gray-500">Baixar pagamentos</span>
              </div>
            </NuxtLink>

          </div>
        </div>

      </div>

    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';

const stats = ref({
  faturamento: 0,
  pendentes: 0,
  baixoEstoque: 0,
  recentes: [] as any[]
});

const formatarMoeda = (val: any) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const getCorStatus = (status: string) => {
  if (['VENDA', 'PAGO', 'Aprovado'].includes(status)) return 'bg-green-100 text-green-700';
  if (['PROPOSTA', 'Proposta'].includes(status)) return 'bg-blue-100 text-blue-700';
  return 'bg-yellow-100 text-yellow-700';
};

onMounted(async () => {
  try {
    // 👇 CHAMA A API CORRETA QUE CRIAMOS
    const dados = await $fetch('/api/dashboard/stats');
    stats.value = dados as any;
  } catch (e) {
    console.error('Erro ao carregar dashboard', e);
  }
});

useHead({ title: 'Dashboard - ERP' });
</script>