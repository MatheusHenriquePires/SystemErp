<template>
  <NuxtLayout name="dashboard-layout">
    <div class="max-w-4xl mx-auto my-8 p-8 bg-white shadow-xl print:shadow-none print:m-0 print:p-0 print:w-full">
      
      <div class="mb-6 flex justify-between items-center print:hidden">
        <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 flex items-center gap-1">
          &larr; Voltar
        </NuxtLink>
        <div class="flex space-x-2">
            <button 
                @click="salvarMargem" 
                :disabled="salvandoMargem"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition disabled:opacity-50"
            >
                {{ salvandoMargem ? 'Salvando...' : '💾 Salvar Margem' }}
            </button>
            <button @click="imprimir" class="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2">
                🖨️ Imprimir
            </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-500">Carregando...</div>
      <div v-else-if="!data" class="text-center text-red-500 py-10">Pedido não encontrado.</div>
      
      <div v-else class="space-y-6 text-slate-800">
        
        <header class="border-b-2 border-slate-800 pb-4 mb-4 flex justify-between items-start">
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

        <section class="p-4 border border-yellow-200 rounded-lg bg-yellow-50 mb-6 flex justify-between items-center print:hidden">
            <div>
                <h2 class="text-sm font-bold text-yellow-800 uppercase">Margem de Lucro / Markup</h2>
                <p class="text-xs text-yellow-700">Multiplica o custo base para gerar o valor final.</p>
            </div>
            <div class="flex items-center space-x-2 bg-white p-2 rounded border border-yellow-200 shadow-sm">
                <span class="text-gray-500 font-bold text-sm">Fator:</span>
                <input 
                    type="number" 
                    v-model.number="fatorMultiplicador" 
                    step="0.1"
                    min="1.0" 
                    class="w-20 text-center font-bold text-lg text-blue-900 border-none focus:ring-0 bg-transparent outline-none"
                />
                <span class="text-gray-400 font-bold">x</span>
            </div>
        </section>

        <div v-for="(grupo, nomeComodo) in itensAgrupados" :key="nomeComodo" class="mb-8 break-inside-avoid">
            
            <h3 class="bg-gray-100 text-slate-800 p-2 font-bold text-lg border-l-4 border-slate-800 mb-2 uppercase tracking-wide flex justify-between">
                <span>{{ nomeComodo === 'PADRAO' ? 'Itens do Pedido' : nomeComodo }}</span>
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
                        
                        <td class="py-2 px-4 text-right text-gray-600 whitespace-nowrap">
                            {{ formatarMoeda(item.preco_unitario * fatorMultiplicador) }}
                        </td>
                        <td class="py-2 pr-2 text-right font-bold text-slate-800 whitespace-nowrap">
                            {{ formatarMoeda((item.quantidade * item.preco_unitario) * fatorMultiplicador) }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="flex justify-end border-t border-gray-300 pt-2">
                <div class="text-right">
                    <span class="text-xs text-gray-500 uppercase mr-2">Subtotal:</span>
                    <span class="font-bold text-slate-800">
                        {{ formatarMoeda(grupo.subtotal * fatorMultiplicador) }}
                    </span>
                </div>
            </div>
        </div>

        <footer class="mt-10 pt-6 border-t-2 border-slate-800 break-inside-avoid">
          <div class="flex justify-end">
            <div class="w-full md:w-1/2 space-y-3">
                
                <div class="print:hidden space-y-1 text-sm text-gray-500 border-b pb-2 mb-2 text-right">
                    <div class="flex justify-between">
                        <span>Custo Base:</span>
                        <span>{{ formatarMoeda(totalBase) }}</span>
                    </div>
                    <div class="flex justify-between text-yellow-700 font-medium">
                        <span>Lucro ({{ ((fatorMultiplicador - 1) * 100).toFixed(0) }}%):</span>
                        <span>+ {{ formatarMoeda(totalFinal - totalBase) }}</span>
                    </div>
                </div>

                <div class="flex justify-between items-end mt-2">
                    <span class="text-lg font-bold text-slate-900 uppercase">Total Final</span>
                    <span class="text-3xl font-extrabold text-green-700">{{ formatarMoeda(totalFinal) }}</span>
                </div>
            </div>
          </div>
          
          <div class="mt-12 text-center text-xs text-gray-400">
            <p>Orçamento válido por 10 dias.</p>
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
const salvandoMargem = ref(false);
const fatorMultiplicador = ref(1.0); // Margem inicial

// --- CÁLCULOS E AGRUPAMENTO ---

const itensAgrupados = computed(() => {
    if (!data.value || !data.value.itens) return {};

    return data.value.itens.reduce((acc: any, item: any) => {
        let comodoKey = item.comodo;
        if (!comodoKey || comodoKey.trim() === '') comodoKey = 'PADRAO';

        if (!acc[comodoKey]) acc[comodoKey] = { itens: [], subtotal: 0 };

        // Subtotal base (sem markup)
        const totalItemBase = (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0);

        acc[comodoKey].itens.push(item);
        acc[comodoKey].subtotal += totalItemBase;

        return acc;
    }, {});
});

const totalBase = computed(() => {
    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((acc: number, item: any) => {
        return acc + ((Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0));
    }, 0);
});

const totalFinal = computed(() => {
    return totalBase.value * fatorMultiplicador.value;
});

// --- AÇÕES ---

const salvarMargem = async () => {
    if (!confirm(`Atualizar o total para ${formatarMoeda(totalFinal.value)}?`)) return;
    
    salvandoMargem.value = true;
    try {
        await $fetch('/api/pedidos', {
            method: 'PUT',
            body: { 
                id: id, 
                valor_total: totalFinal.value 
            }
        });
        alert('Margem salva com sucesso!');
    } catch (e: any) {
        alert('Erro ao salvar: ' + e.message);
    } finally {
        salvandoMargem.value = false;
    }
};

const imprimir = () => window.print();

const formatarMoeda = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const formatarData = (dataIso: string) => {
    if (!dataIso) return '';
    try { return new Date(dataIso).toLocaleDateString('pt-BR'); } catch { return dataIso; }
};

const fetchData = async () => {
    try {
        const response: any = await $fetch(`/api/pedidos/${id}`);
        data.value = response;
        
        // RECUPERAR A MARGEM USADA ANTERIORMENTE
        // Se o valor salvo no banco for maior que a soma dos custos, calculamos o fator reverso
        if (data.value && data.value.itens) {
            const custoTotal = data.value.itens.reduce((acc: number, item: any) => acc + (Number(item.quantidade) * Number(item.preco_unitario)), 0);
            const valorSalvo = Number(data.value.valor_total || 0);
            
            if (custoTotal > 0 && valorSalvo > custoTotal) {
                fatorMultiplicador.value = Number((valorSalvo / custoTotal).toFixed(2));
            } else {
                fatorMultiplicador.value = 1.0;
            }
        }

    } catch (e) {
        console.error("Erro ao carregar", e);
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