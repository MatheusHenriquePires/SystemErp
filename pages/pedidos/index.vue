<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">
      
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">📦 Gestão de Pedidos</h1>
        <NuxtLink to="/pedidos/novo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2">
          <span>+</span> Novo Pedido
        </NuxtLink>
      </div>

      <div class="flex space-x-2 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
        <button v-for="aba in abas" :key="aba.key"
          @click="mudarAba(aba.key)"
          :class="[
            'px-4 py-2 rounded-t-lg text-sm font-medium transition whitespace-nowrap border-b-2',
            filtroAtual === aba.key 
              ? 'border-blue-600 text-blue-700 bg-blue-50' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ aba.label }}
        </button>
      </div>

      <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Responsável</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="7" class="p-8 text-center text-gray-500 italic">Carregando dados...</td>
              </tr>

              <tr v-else-if="pedidos.length === 0">
                <td colspan="7" class="p-12 text-center text-gray-500">
                  <div class="flex flex-col items-center justify-center">
                    <p class="text-lg font-medium text-gray-900">Nenhum pedido encontrado</p>
                    <p class="text-sm text-gray-500">Não há registros na aba "{{ abas.find(a => a.key === filtroAtual)?.label }}".</p>
                  </div>
                </td>
              </tr>
              
              <tr v-for="pedido in pedidos" :key="pedido.id" class="hover:bg-gray-50 transition duration-150 group">
                <td class="px-6 py-4 text-sm font-mono font-bold text-gray-900">#{{ pedido.id }}</td>
                
                <td class="px-6 py-4 text-sm text-gray-700 font-medium">
                  {{ pedido.nome_cliente || pedido.cliente_nome }}
                </td>
                
                <td class="px-6 py-4 text-sm text-gray-500">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 uppercase">
                            {{ (pedido.vendedor_nome || 'S')[0] }}
                        </div>
                        <span class="truncate max-w-[150px] font-medium">{{ pedido.vendedor_nome || 'Sistema' }}</span>
                    </div>
                </td>

                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ new Date(pedido.data_criacao).toLocaleDateString('pt-BR') }}
                </td>
                
                <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {{ formatarMoeda(pedido.valor_total || pedido.final_total || pedido.total) }}
                </td>

                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide border',
                    classesStatus[pedido.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                  ]">
                    {{ pedido.status }}
                  </span>
                </td>

                <td class="px-6 py-4 text-center text-sm">
                  <div class="flex justify-center items-center space-x-2">
                    
                    <button 
                      v-if="['Orçamento', 'ORCAMENTO'].includes(pedido.status)" 
                      @click="atualizarStatus(pedido.id, 'PROPOSTA')"
                      class="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition flex items-center gap-1"
                      title="Mover para Proposta"
                    >
                      ➡️ <span class="hidden xl:inline">Enviar</span>
                    </button>

                    <button 
                      v-if="['PROPOSTA', 'PENDENTE'].includes(pedido.status)" 
                      @click="atualizarStatus(pedido.id, 'VENDA')"
                      class="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition flex items-center gap-1"
                      title="Aprovar Venda"
                    >
                      ✅ <span class="hidden xl:inline">Aprovar</span>
                    </button>

                    <button 
                      v-if="['VENDA', 'Produção'].includes(pedido.status)" 
                      @click="atualizarStatus(pedido.id, 'PAGO')"
                      class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition flex items-center gap-1"
                      title="Marcar como Pago"
                    >
                      💰 <span class="hidden xl:inline">Receber</span>
                    </button>

                    <NuxtLink 
                      :to="`/pedidos/${pedido.id}`"
                      class="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm flex items-center gap-1 transition"
                      title="Ver Detalhes"
                    >
                      👁️
                    </NuxtLink>

                    <button 
                      @click="excluirPedido(pedido.id)"
                      class="text-red-500 bg-white border border-red-200 hover:bg-red-50 px-2 py-1.5 rounded-md text-xs font-medium shadow-sm flex items-center justify-center transition"
                      title="Excluir Pedido"
                    >
                      🗑️
                    </button>

                  </div>
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

const pedidos = ref<any[]>([]); // Tipagem básica para array
const loading = ref(true);
const filtroAtual = ref('TODOS');

const abas = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'Orçamento', label: '📝 Orçamento' }, 
  { key: 'PROPOSTA', label: '📢 Propostas' },
  { key: 'VENDA', label: '📦 Vendas' },
  { key: 'PAGO', label: '✅ Finalizados' }
];

const classesStatus: Record<string, string> = {
  'Orçamento': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'ORCAMENTO': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'PROPOSTA': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'VENDA': 'bg-blue-50 text-blue-700 border-blue-200',
  'Produção': 'bg-blue-50 text-blue-700 border-blue-200',
  'PAGO': 'bg-green-50 text-green-700 border-green-200',
  'PENDENTE': 'bg-gray-50 text-gray-700 border-gray-200'
};

const carregarPedidos = async () => {
  loading.value = true;
  try {
    const data: any = await $fetch(`/api/pedidos?status=${filtroAtual.value}`);
    pedidos.value = data || [];
  } catch (error) {
    console.error("Erro ao carregar pedidos", error);
  } finally {
    loading.value = false;
  }
};

const mudarAba = (novoStatus: string) => {
  filtroAtual.value = novoStatus;
  carregarPedidos();
};

const atualizarStatus = async (id: number, novoStatus: string) => {
  if(!confirm(`Deseja alterar o status para ${novoStatus}?`)) return;
  try {
    await $fetch('/api/pedidos', { method: 'PUT', body: { id, status: novoStatus } });
    await carregarPedidos();
  } catch (e) { alert('Erro ao atualizar status.'); }
};

// --- FUNÇÃO DE EXCLUIR CORRIGIDA ---
const excluirPedido = async (id: number) => {
    if (!confirm('ATENÇÃO: Tem certeza que deseja EXCLUIR este pedido?\nIsso apagará também os itens e o financeiro dele.')) return;

    try {
        // CORREÇÃO: Usar crases (`) e a variável correta (id)
        await $fetch(`/api/pedidos/${id}`, {
            method: 'DELETE'
        });
        
        // Remove da lista visualmente
        pedidos.value = pedidos.value.filter((p: any) => p.id !== id);
        
    } catch (e: any) {
        // Tenta pegar a mensagem de erro do servidor ou usa a genérica
        const msg = e.data?.statusMessage || e.message || 'Erro desconhecido';
        alert('Erro ao excluir: ' + msg);
    }
};

const formatarMoeda = (val: any) => {
  const numero = Number(val);
  const valorSeguro = isNaN(numero) ? 0 : numero;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorSeguro);
};

onMounted(carregarPedidos);
useHead({ title: 'Gestão de Pedidos' });
</script>