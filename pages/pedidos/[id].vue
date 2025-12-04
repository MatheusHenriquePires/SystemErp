<template>
  <NuxtLayout name="dashboard-layout">
    <div class="max-w-4xl mx-auto my-8 p-8 bg-white shadow-xl print:shadow-none print:m-0 print:p-0 print:w-full">
      
      <div class="mb-6 flex justify-between items-center print:hidden">
        <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 flex items-center gap-1">
          &larr; Voltar para Pedidos
        </NuxtLink>
        <button @click="printProposal" class="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2">
            🖨️ Imprimir / Gerar PDF
        </button>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-500">
        Carregando proposta...
      </div>

      <div v-else-if="!data" class="text-center text-red-500 py-10">
        Pedido não encontrado.
      </div>
      
      <div v-else class="space-y-6 text-slate-800">
        
        <header class="border-b-2 border-slate-800 pb-4 mb-8 flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-extrabold uppercase tracking-wide text-slate-900">Orçamento</h1>
            <p class="text-sm text-gray-500 mt-1">Nº #{{ data.id }}</p>
          </div>
          <div class="text-right">
             <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
             <p class="font-bold text-xl text-slate-900">{{ data.nome_cliente || 'Cliente' }}</p>
             <p class="text-sm text-gray-600">{{ formatarData(data.data_criacao) }}</p>
          </div>
        </header>

        <div v-for="(grupo, nomeComodo) in itensAgrupados" :key="nomeComodo" class="mb-8 break-inside-avoid">
            
            <h3 class="bg-gray-100 text-slate-800 p-2 font-bold text-lg border-l-4 border-slate-800 mb-2 uppercase tracking-wide flex justify-between">
                <span>{{ nomeComodo }}</span>
            </h3>

            <table class="w-full text-sm mb-2">
                <thead class="border-b border-gray-300">
                    <tr class="text-gray-500 text-left">
                        <th class="py-2 pl-2 font-medium w-full">Descrição</th>
                        <th class="py-2 px-4 font-medium text-center">Qtd</th>
                        <th class="py-2 px-4 font-medium text-right">Unitário</th>
                        <th class="py-2 pr-2 font-medium text-right">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="(item, idx) in grupo.itens" :key="idx">
                        <td class="py-2 pl-2 text-gray-700">{{ item.descricao }}</td>
                        <td class="py-2 px-4 text-center text-gray-600">{{ item.quantidade }}</td>
                        <td class="py-2 px-4 text-right text-gray-600 whitespace-nowrap">{{ formatarMoeda(item.preco_unitario) }}</td>
                        <td class="py-2 pr-2 text-right font-bold text-slate-800 whitespace-nowrap">
                            {{ formatarMoeda(item.quantidade * item.preco_unitario) }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="flex justify-end border-t border-gray-300 pt-2">
                <div class="text-right">
                    <span class="text-xs text-gray-500 uppercase mr-2">Subtotal {{ nomeComodo }}:</span>
                    <span class="font-bold text-slate-800">{{ formatarMoeda(grupo.subtotal) }}</span>
                </div>
            </div>
        </div>

        <footer class="mt-10 pt-6 border-t-2 border-slate-800 break-inside-avoid">
          <div class="flex justify-end">
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-[250px]">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600">Total de Itens</span>
                <span class="font-medium">{{ totalQuantidadeItens }} un.</span>
              </div>
              <div class="flex justify-between items-end mt-2 pt-2 border-t border-slate-200">
                <span class="text-lg font-bold text-slate-900 uppercase">Total Geral</span>
                <span class="text-2xl font-extrabold text-green-700">{{ formatarMoeda(totalGeral) }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-12 text-center text-xs text-gray-400">
            <p>Este orçamento tem validade de 10 dias.</p>
          </div>
        </footer>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.id;

const data = ref<any>(null);
const loading = ref(true);

// --- CÁLCULOS E AGRUPAMENTO ---

const itensAgrupados = computed(() => {
    if (!data.value || !data.value.itens) return {};

    // Reduz o array plano em um Objeto agrupado por cômodo
    return data.value.itens.reduce((acc: any, item: any) => {
        // Se o item não tiver cômodo, chama de "Outros"
        const comodo = item.comodo || 'Outros Ambientes';

        if (!acc[comodo]) {
            acc[comodo] = { itens: [], subtotal: 0 };
        }

        const totalItem = (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0);

        acc[comodo].itens.push(item);
        acc[comodo].subtotal += totalItem;

        return acc;
    }, {});
});

const totalGeral = computed(() => {
    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((acc: number, item: any) => {
        return acc + ((Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0));
    }, 0);
});

const totalQuantidadeItens = computed(() => {
    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((acc: number, item: any) => acc + (Number(item.quantidade) || 0), 0);
});

// --- FUNÇÕES UTILITÁRIAS ---

function formatarMoeda(valor: any) {
    const num = Number(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function formatarData(dataIso: string) {
    if (!dataIso) return '';
    return new Date(dataIso).toLocaleDateString('pt-BR');
}

function printProposal() {
    window.print();
}

// --- CARREGAMENTO ---

const fetchData = async () => {
    try {
        const response = await $fetch(`/api/pedidos/${id}`);
        data.value = response;
    } catch (e) {
        console.error("Erro ao carregar pedido", e);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<style scoped>
@media print {
  .print\:hidden { display: none !important; }
  .break-inside-avoid { break-inside: avoid; }
  body { background: white; }
  .shadow-xl { box-shadow: none !important; }
}
</style>