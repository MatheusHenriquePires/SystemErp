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
                  {{ formatarMoeda(pedido.total) }}
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
                  
                  <button 
                    @click="abrirImpressao(pedido.id)"
                    class="text-slate-600 bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded shadow-sm transition"
                    title="Imprimir Pedido"
                  >
                     🖨️
                  </button>

                  <button v-if="pedido.status === 'ORCAMENTO' || pedido.status === 'PENDENTE'" 
                    @click="atualizarStatus(pedido.id, 'VENDA')"
                    class="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded shadow-sm transition"
                    title="Aprovar e Virar Venda"
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

// Abas de Navegação
const abas = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'ORCAMENTO', label: '📝 Orçamentos' },
  { key: 'VENDA', label: '📦 Vendas Abertas' },
  { key: 'PAGO', label: '✅ Finalizados' }
];

// Cores das Badges
const classesStatus: Record<string, string> = {
  'ORCAMENTO': 'bg-yellow-100 text-yellow-800',
  'VENDA': 'bg-blue-100 text-blue-800',
  'PAGO': 'bg-green-100 text-green-800',
  'PENDENTE': 'bg-gray-100 text-gray-800'
};

// Buscar Pedidos
const carregarPedidos = async () => {
  loading.value = true;
  try {
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
  carregarPedidos();
};

// Atualizar Status (PUT)
const atualizarStatus = async (id: number, novoStatus: string) => {
  const acao = novoStatus === 'VENDA' ? 'Aprovar Orçamento' : 'Confirmar Recebimento';
  
  if (!confirm(`Tem certeza que deseja ${acao}?`)) return;

  try {
    await $fetch('/api/pedidos', {
      method: 'PUT',
      body: { 
        id: id, 
        status: novoStatus 
      }
    });
    
    await carregarPedidos();
    alert('Status atualizado com sucesso!');
    
  } catch (e) {
    console.error(e);
    alert('Erro ao atualizar status.');
  }
};

// Função de Imprimir (NOVA)
const abrirImpressao = (id: number) => {
  // Abre a página de impressão em uma nova aba
  window.open(`/pedidos/imprimir/${id}`, '_blank');
};

const formatarMoeda = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

onMounted(() => {
  carregarPedidos();
});

useHead({ title: 'Gestão de Pedidos' });
</script>