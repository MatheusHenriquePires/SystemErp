<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">🛒 Vendas Registradas</h1>
        <NuxtLink to="/vendas/nova" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          + Nova Venda
        </NuxtLink>
      </div>

      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Carregando vendas...
                </td>
              </tr>
              <tr v-else-if="vendas.length === 0">
                <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Nenhuma venda registrada ainda.
                </td>
              </tr>
              <tr v-for="venda in vendas" :key="venda.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{{ venda.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ venda.cliente_nome }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(venda.data_venda).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {{ formatarMoeda(venda.valor_total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    venda.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ venda.status === 'concluido' ? 'Concluída' : 'Aguardando' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';

// Definição das vendas (simplesmente para demonstrar a estrutura)
const vendas = ref<any[]>([]);
const loading = ref(true);

// Função para formatar moeda (reuso do financeiro)
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

// Função para carregar as vendas
const carregarVendas = async () => {
  loading.value = true;
  try {
    // Usamos useFetch para buscar a lista de vendas
    const { data: vendasData } = await useFetch('/api/vendas');
    
    // Supondo que o endpoint /api/vendas existe e retorna um array. 
    // Vamos criar o endpoint no Próximo Passo 3.
    vendas.value = vendasData.value || [];

  } catch (e) {
    console.error("Erro ao carregar vendas:", e);
    // Em caso de erro, definimos a lista como vazia
    vendas.value = []; 
  } finally {
    loading.value = false;
  }
}

// Carrega ao montar
onMounted(carregarVendas);

// Configuração do título da página
useHead({ title: 'Vendas - NetMark ERP' });
</script>