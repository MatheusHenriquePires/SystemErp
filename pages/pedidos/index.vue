<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">
      
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">📦 Gestão de Pedidos</h1>
        <NuxtLink to="/pedidos/novo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition">
          + Novo Pedido/Orçamento
        </NuxtLink>
      </div>

      <div class="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <button v-for="aba in abas" :key="aba.key"
          @click="mudarAba(aba.key)"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap',
            filtroAtual === aba.key 
              ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' 
              : 'bg-white text-gray-500 hover:bg-gray-50 border'
          ]"
        >
          {{ aba.label }}
        </button>
      </div>

      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="6" class="p-8 text-center text-gray-500">Carregando...</td>
              </tr>
              <tr v-else-if="pedidos.length === 0">
                <td colspan="6" class="p-8 text-center text-gray-500">Nenhum pedido encontrado nesta categoria.</td>
              </tr>
              
              <tr v-for="pedido in pedidos" :key="pedido.id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{{ pedido.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ pedido.cliente_nome }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ new Date(pedido.data_criacao).toLocaleDateString('pt-BR') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  {{ formatarMoeda(pedido.valor_total) }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    classesStatus[pedido.status] || 'bg-gray-100 text-gray-800'
                  ]">
                    {{ pedido.status }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                  
                  <button v-if="pedido.status === 'ORCAMENTO'" 
                    @click="atualizarStatus(pedido.id, 'VENDA')"
                    class="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded shadow-sm transition"
                    title="Baixar Estoque e Virar Venda"
                  >
                    ✅ Aprovar
                  </button>

                  <button v-if="pedido.status === 'VENDA'" 
                    @click="atualizarStatus(pedido.id, 'PAGO')"
                    class="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded shadow-sm transition"
                    title="Lançar no Caixa"
                  >
                    💰 Receber
                  </button>

                  <NuxtLink :to="`/pedidos/${pedido.id}`" class="text-gray-400 hover:text-blue-600">
                    📄 Ver
                  </NuxtLink>
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

// Estado
const pedidos = ref([]);
const loading = ref(true);
const filtroAtual = ref('TODOS');

// Configuração das Abas
const abas = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'ORCAMENTO', label: '📝 Orçamentos' },
  { key: 'VENDA', label: '📦 Vendas Abertas' },
  { key: 'PAGO', label: '✅ Finalizados' }
];

// Estilização das Badges de Status
const classesStatus = {
  'ORCAMENTO': 'bg-yellow-100 text-yellow-800',
  'VENDA': 'bg-blue-100 text-blue-800',
  'PAGO': 'bg-green-100 text-green-800',
  'CANCELADO': 'bg-red-100 text-red-800'
};

// Carregar Dados
const carregarPedidos = async () => {
  loading.value = true;
  try {
    // Chama a API passando o status selecionado
    const data = await $fetch(`/api/pedidos?status=${filtroAtual.value}`);
    pedidos.value = data || [];
  } catch (e) {
    console.error(e);
    alert('Erro ao carregar pedidos');
  } finally {
    loading.value = false;
  }
};

// Mudar Aba
const mudarAba = (novoStatus: string) => {
  filtroAtual.value = novoStatus;
  carregarPedidos(); // Recarrega a lista
};

// Ação de Atualizar Status (Conecta com a API POST)
const atualizarStatus = async (id: number, novoStatus: string) => {
  const acao = novoStatus === 'VENDA' ? 'Aprovar Orçamento e Baixar Estoque' : 'Confirmar Recebimento no Caixa';
  
  if (!confirm(`Tem certeza que deseja ${acao}?`)) return;

  try {
    await $fetch('/api/pedidos/status', {
      method: 'POST',
      body: { id, novo_status: novoStatus }
    });
    
    // Atualiza a lista para refletir a mudança
    await carregarPedidos();
    alert('Sucesso! O sistema atualizou estoque/financeiro automaticamente.');
    
  } catch (e) {
    alert('Erro ao atualizar status.');
  }
};

const formatarMoeda = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

// Inicialização
onMounted(() => {
  carregarPedidos();
});

useHead({ title: 'Pedidos - ERP' });
</script>