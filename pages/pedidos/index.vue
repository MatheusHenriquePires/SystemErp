<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">
      
      <!-- Cabeçalho -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">📦 Gestão de Pedidos</h1>
        <NuxtLink to="/pedidos/novo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition">
          + Novo Pedido/Orçamento
        </NuxtLink>
      </div>

      <!-- Abas de Filtro -->
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

      <!-- Tabela -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th> <!-- ✅ NOVA COLUNA -->
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>

            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="7" class="p-8 text-center text-gray-500">Carregando...</td>
              </tr>

              <tr v-else-if="pedidos.length === 0">
                <td colspan="7" class="p-8 text-center text-gray-500">Nenhum pedido encontrado nesta aba.</td>
              </tr>
              
              <tr v-for="pedido in pedidos" :key="pedido.id" class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 text-sm font-bold text-gray-900">#{{ pedido.id }}</td>
                <td class="px-6 py-4 text-sm text-gray-600 font-medium">{{ pedido.nome_cliente || pedido.cliente_nome }}</td>
                
                <!-- ✅ MOSTRA QUEM FEZ O ORÇAMENTO -->
                <td class="px-6 py-4 text-sm text-gray-500">
                    <div class="flex items-center">
                        <span class="bg-gray-100 text-gray-600 py-1 px-2 rounded text-xs font-bold uppercase">
                            {{ pedido.vendedor_nome || 'Sistema' }}
                        </span>
                    </div>
                </td>

                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ new Date(pedido.data_criacao).toLocaleDateString('pt-BR') }}
                </td>
                
                <!-- Valor Total (corrigido para não mostrar NaN) -->
                <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {{ formatarMoeda(pedido.valor_total || pedido.final_total || pedido.total) }}
                </td>

                <!-- Status Colorido -->
                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'px-2 py-1 text-xs font-semibold rounded-full border',
                    classesStatus[pedido.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                  ]">
                    {{ pedido.status }}
                  </span>
                </td>

                <!-- Botões de Ação Dinâmicos -->
                <td class="px-6 py-4 text-center text-sm">
                  <div class="flex justify-center space-x-2">
                    
                    <!-- Botão ORÇAMENTO -> PROPOSTA -->
                    <button 
                      v-if="['Orçamento', 'ORCAMENTO'].includes(pedido.status)" 
                      @click="atualizarStatus(pedido.id, 'PROPOSTA')"
                      class="text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs shadow-sm flex items-center gap-1"
                      title="Enviar Proposta"
                    >
                      ➡️ Proposta
                    </button>

                    <!-- Botão PROPOSTA -> VENDA -->
                    <button 
                      v-if="['PROPOSTA', 'PENDENTE'].includes(pedido.status)" 
                      @click="atualizarStatus(pedido.id, 'VENDA')"
                      class="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs shadow-sm flex items-center gap-1"
                      title="Aprovar Venda"
                    >
                      ✅ Aprovar
                    </button>

                    <!-- Botão VENDA -> PAGO -->
                    <button 
                      v-if="['VENDA', 'Produção'].includes(pedido.status)" 
                      @click="atualizarStatus(pedido.id, 'PAGO')"
                      class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs shadow-sm flex items-center gap-1"
                      title="Finalizar"
                    >
                      💰 Receber
                    </button>

                    <!-- Botão VER DETALHES (Sempre visível) -->
                    <NuxtLink 
                      :to="`/pedidos/${pedido.id}`"
                      class="text-gray-700 bg-gray-100 border border-gray-300 hover:bg-white px-3 py-1 rounded text-xs flex items-center gap-1 transition"
                    >
                      👁️ Ver
                    </NuxtLink>

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
// Importação explícita do layout não é necessária aqui se estiver usando no template,
// mas se for usar definePageMeta, é melhor.
// Vamos manter o padrão simples do Nuxt 3.
import DashboardLayout from '~/layouts/DashboardLayout.vue';

const pedidos = ref([]);
const loading = ref(true);
const filtroAtual = ref('TODOS');

// Configuração das Abas (As chaves devem bater com o que o banco espera ou o filtro 'TODOS')
const abas = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'Orçamento', label: '📝 Orçamentos' }, // Atenção: 'Orçamento' deve ser igual ao salvo no banco
  { key: 'PROPOSTA', label: '📢 Propostas' },
  { key: 'VENDA', label: '📦 Vendas' },
  { key: 'PAGO', label: '✅ Finalizados' }
];

// Cores para cada status
const classesStatus: Record<string, string> = {
  'Orçamento': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'ORCAMENTO': 'bg-yellow-50 text-yellow-700 border-yellow-200', // Caso tenha salvo em maiúsculo antes
  'PROPOSTA': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'VENDA': 'bg-blue-50 text-blue-700 border-blue-200',
  'Produção': 'bg-blue-50 text-blue-700 border-blue-200',
  'PAGO': 'bg-green-50 text-green-700 border-green-200',
  'PENDENTE': 'bg-gray-50 text-gray-700 border-gray-200'
};

const carregarPedidos = async () => {
  loading.value = true;
  try {
    // Passamos o status escolhido na URL para o backend filtrar
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
  carregarPedidos(); // Recarrega a lista com o novo filtro
};

const atualizarStatus = async (id: number, novoStatus: string) => {
  if(!confirm(`Deseja alterar o status para ${novoStatus}?`)) return;
  
  try {
    // Usa o método PUT para atualizar, garantindo que vá para o arquivo correto no backend
    await $fetch('/api/pedidos', {
        method: 'PUT',
        body: { id, status: novoStatus }
    });
    
    // Atualiza a lista para refletir a mudança (o item pode sumir da aba atual se ela for filtrada)
    await carregarPedidos();
  } catch (e) {
    alert('Erro ao atualizar status. Verifique se você tem permissão.');
  }
};

// Função segura para formatar moeda (evita NaN)
const formatarMoeda = (val: any) => {
  const numero = Number(val);
  const valorSeguro = isNaN(numero) ? 0 : numero;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorSeguro);
};

onMounted(carregarPedidos);
useHead({ title: 'Gestão de Pedidos' });
</script>