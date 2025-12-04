<template>
  <NuxtLayout>
    <div class="max-w-4xl mx-auto my-8 p-8 bg-white shadow-xl print:shadow-none print:m-0 print:p-0">
      
      <div class="mb-6 flex justify-between items-center print:hidden">
        <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600">
          &larr; Voltar para Pedidos
        </NuxtLink>
        <div class="flex space-x-2">
            <button 
                @click="applyMarkup" 
                :disabled="savingMarkup"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition disabled:opacity-50"
            >
                {{ savingMarkup ? 'Salvando Markup...' : 'Salvar Markup' }}
            </button>
            <button @click="printProposal" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition">
                🖨️ Imprimir / Salvar PDF
            </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20">
        Carregando Proposta...
      </div>
      <div v-else-if="error || !data" class="text-red-600 border border-red-200 p-4 rounded bg-red-50">
        Erro ao carregar proposta. O pedido não foi encontrado ou a sessão expirou.
      </div>
      
      <div v-else class="space-y-6">
        
        <header class="border-b pb-4 mb-4 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-extrabold text-gray-800">PROPOSTA #{{ id }}</h1>
            <p class="mt-1 text-sm text-gray-500">
              Data: {{ formatarData(data.data_criacao) }}
            </p>
          </div>
          <div class="text-right">
             <p class="font-bold text-lg text-gray-900">{{ data.cliente_nome || 'ARBOREO' }}</p>
             <p class="text-sm text-gray-500">{{ data.cliente_cidade || 'Cidade não informada' }}</p>
          </div>
        </header>

        <section class="p-4 border rounded-lg bg-yellow-50 mb-6 flex justify-between items-center print:hidden">
            <h2 class="text-lg font-semibold text-yellow-800"> Markup Adicional</h2>
            <div class="flex items-center space-x-2">
                <input 
                    type="number" 
                    v-model.number="markupPercent" 
                    step="0.01"
                    class="w-20 text-center rounded-md border-yellow-300 focus:border-yellow-500"
                />
                <span class="text-xl font-bold text-yellow-800">%</span>
            </div>
        </section>

        <section class="mb-8">
            <h2 class="text-lg font-semibold mb-4">Detalhamento dos Itens</h2>

            <div v-for="(grupo, comodoNome) in itensAgrupados" :key="comodoNome" class="mb-8 border p-6 rounded-lg bg-gray-50 print:break-inside-avoid">
                <h3 class="font-extrabold text-xl mb-3 text-indigo-700 border-b pb-2">
                    {{ comodoNome }}
                </h3>

                <ul class="space-y-2 text-sm text-gray-700">
                    <li v-for="(item, index) in grupo.itens" :key="index" class="flex justify-between border-b border-dashed pb-1">
                        <span class="w-3/5">{{ item.descricao }} ({{ item.quantidade }}x)</span> 
                        <span class="font-medium">{{ formatarMoeda(Number(item.quantidade) * Number(item.preco_unitario)) }}</span>
                    </li>
                </ul>

                <div class="text-right mt-4 pt-2 border-t font-bold text-lg text-indigo-800">
                    Total do Cômodo: {{ formatarMoeda(grupo.total) }}
                </div>
            </div>
        </section>

        <footer class="pt-6 border-t mt-6">
          <div class="flex justify-end">
            <div class="w-full md:w-1/2 space-y-2">

              <div class="flex justify-between text-gray-700">
                <span class="font-medium">Total Base dos Itens:</span>
                <span class="font-medium">{{ formatarMoeda(totalBase) }}</span>
              </div>

              <div v-if="markupPercent > 0" class="flex justify-between text-yellow-700 font-bold pt-1 border-t border-yellow-100">
                <span class="text-sm">Markup ({{ markupPercent }}%):</span>
                <span class="text-sm">+ {{ formatarMoeda(totalMarkupAcrescido) }}</span>
              </div>
              
              <div class="flex justify-between text-xl font-extrabold pt-4 border-t-2 border-blue-100">
                <span class="text-blue-800">TOTAL FINAL:</span>
                <span :class="{'text-red-600': totalFinal > totalBase}">{{ formatarMoeda(totalFinal) }}</span>
              </div>

            </div>
          </div>
        </footer>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const id = useRoute().params.id;
const data = ref<any>(null);
const loading = ref(true);
const error = ref<any>(null);
const savingMarkup = ref(false);

const markupPercent = ref(0); 

// Propriedades Computadas (Logic)

const itensAgrupados = computed(() => {
    if (!data.value || !data.value.itens) return {};

    return data.value.itens.reduce((groups, item) => {
        // [CORREÇÃO FINAL]: Lê o nome da coluna bruta 'comodo'
        const comodoName = String(item.comodo || '').trim() || 'Geral'; 
        
        if (!groups[comodoName]) {
            groups[comodoName] = { total: 0, itens: [] };
        }
        
        const quantidade = Number(item.quantidade);
        const preco = Number(item.preco_unitario);
        const subtotal = quantidade * preco;
        
        groups[comodoName].total += subtotal;
        groups[comodoName].itens.push(item);
        
        return groups;
    }, {});
});


// ... (resto das funções computadas e actions mantidas) ...

const totalBase = computed(() => {
    const baseFromData = parseFloat(data.value?.valor_total || data.value?.total || 0);
    if (baseFromData > 0) return baseFromData;

    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((sum: number, item: any) => {
        const quantidade = Number(item.quantidade || item.quantidade);
        const preco = Number(item.preco_unitario || item.preco_unitario);
        return sum + (quantidade * preco);
    }, 0);
});

const totalMarkupAcrescido = computed(() => {
    return totalBase.value * (markupPercent.value / 100);
});
const totalFinal = computed(() => {
    const finalFromData = parseFloat(data.value?.final_total || 0);
    if (finalFromData > 0) return finalFromData;

    return totalBase.value + totalMarkupAcrescido.value;
});


const applyMarkup = async () => {
    if (!confirm(`Confirma aplicar um acréscimo de ${markupPercent.value}% ao valor total?`)) return;
    
    savingMarkup.value = true;
    try {
        const response = await $fetch(`/api/pedidos/${id}/markup`, {
            method: 'PATCH',
            body: { markup_percent: markupPercent.value }
        });
        
        data.value.final_total = response.updated.final_total;
        alert('Markup salvo e total final atualizado!');

    } catch (e: any) {
        alert(`Erro ao salvar markup: ${e.message || 'Erro de servidor'}`);
    } finally {
        savingMarkup.value = false;
    }
}

const fetchData = async () => {
    try {
        const response = await $fetch(`/api/pedidos/${id}`); 
        data.value = response;

        if (data.value && data.value.markup_percent) {
            markupPercent.value = parseFloat(data.value.markup_percent);
        }
    } catch (e: any) {
        error.value = e.data || e; 
    } finally {
        loading.value = false;
    }
};

// Funções utilitárias (mantidas)
function formatarMoeda(valor: number): string { /* ... */ }
function formatarData(data: string): string { /* ... */ }
function printProposal(): void { /* ... */ }


onMounted(fetchData);
</script>

<style scoped>
@media print {
  .print\:hidden {
    display: none !important;
  }
  .max-w-4xl.mx-auto {
    width: 100%;
    margin: 0;
    padding: 0;
  }
}
</style>