<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">

      <template #header-actions>
          <NuxtLink to="/produtos/novo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition">
            + Novo Produto
          </NuxtLink>
      </template>

      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">📦 Catálogo de Produtos</h1>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-slate-200 dark:border-gray-700">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preço</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estoque</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
           <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    
    <tr v-if="loading">
        <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Carregando catálogo...</td>
    </tr>
    
    <tr v-else-if="produtos.length === 0">
        <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
            Nenhum produto encontrado. Importe uma tabela ou cadastre um novo.
        </td>
    </tr>
    
    <template v-else>
        <tr v-for="produto in produtos" :key="produto.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                {{ produto.nome }} <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">({{ produto.medida }})</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ produto.categoria }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-emerald-600">
                {{ formatarMoeda(produto.preco) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                <span :class="{'text-red-500': produto.estoque_atual < 10}">
                    {{ produto.estoque_atual }}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <NuxtLink :to="`/produtos/${produto.id}/editar`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                    Editar
                </NuxtLink>
            </td>
        </tr>
    </template>
</tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';

const loading = ref(true);
const produtos = ref<any[]>([]);

// Função de Formatação de Moeda
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

// Função para buscar dados
const carregarProdutos = async () => {
  loading.value = true;
  try {
    // Note: Esta API depende de um JWT válido para o filtro multi-empresa
    const data = await $fetch('/api/produtos'); 
    produtos.value = data || [];
  } catch (e) {
    console.error("Erro ao buscar produtos:", e);
    produtos.value = [];
  } finally {
    loading.value = false;
  }
};

// Carrega os dados ao montar o componente
onMounted(carregarProdutos);
useHead({ title: 'Produtos - NetMark ERP' });
</script>

<style scoped>
/* Estilo da Tabela - Sem precisar de classes dinâmicas complexas no CSS */
</style>