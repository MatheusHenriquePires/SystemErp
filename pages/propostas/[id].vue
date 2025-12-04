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
                {{ savingMarkup ? 'Salvando...' : 'Salvar Markup' }}
            </button>
            <button @click="printProposal" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition">
                🖨️ Imprimir
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
            <p class="mt-1 text-sm text-gray-500">Data: {{ formatarData(data.data_criacao) }}</p>
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

        <section class="mb-6 border-b pb-4">
          <h2 class="text-lg font-semibold mb-3">Itens Inclusos</h2>
          <div class="space-y-4">
            <div v-for="(item, index) in data.itens" :key="index" class="p-4 border rounded-lg bg-gray-50"> 
              <h3 class="font-bold text-lg text-gray-800">{{ item.descricao || item.name }}</h3> 
              <div class="text-sm text-gray-600 mt-1 space-y-1">
                <p>Quantidade: {{ item.quantidade }}</p> 
                <p>Preço Unitário: {{ formatarMoeda(item.preco_unitario) }}</p>
                <p class="font-semibold text-gray-700">Subtotal: {{ formatarMoeda(Number(item.quantidade) * Number(item.preco_unitario)) }}</p>
              </div>
            </div>
          </div>
        </section>

        <footer class="pt-6 border-t mt-6">
          <div class="flex justify-end">
            <div class="w-full md:w-1/2 space-y-2">

              <div class="flex justify-between text-gray-700">
                <span class="font-medium">Total Base dos Itens:</span>
                <span class="font-medium">{{ formatarMoeda(totalBase) }}</span> </div>

              <div v-if="markupPercent > 0" class="flex justify-between text-yellow-700 font-bold pt-1 border-t border-yellow-100">
                <span class="text-sm">Markup ({{ markupPercent }}%):</span>
                <span class="text-sm">+ {{ formatarMoeda(totalMarkupAcrescido) }}</span> </div>
              
              <div class="flex justify-between text-xl font-extrabold pt-4 border-t-2 border-blue-100">
                <span class="text-blue-800">TOTAL FINAL:</span>
                <span :class="{'text-red-600': totalFinal > totalBase}">{{ formatarMoeda(totalFinal) }}</span> </div>

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

// [NOVO ESTADO]: Porcentagem de Acréscimo
const markupPercent = ref(0); 

// [NOVA COMPUTADA]: Calcula o total base (soma dos itens)
const totalBase = computed(() => {
    // Usa o valor_total/total do banco se existir, senão soma os itens (mais seguro para cálculos)
    const baseFromData = parseFloat(data.value?.valor_total || data.value?.total || 0);
    if (baseFromData > 0) return baseFromData;

    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((sum: number, item: any) => {
        const quantidade = Number(item.quantidade || item.quantity);
        const preco = Number(item.preco_unitario || item.unit_price);
        return sum + (quantidade * preco);
    }, 0);
});

// [NOVA COMPUTADA]: Calcula o valor acrescido
const totalMarkupAcrescido = computed(() => {
    return totalBase.value * (markupPercent.value / 100);
});

// [NOVA COMPUTADA]: Calcula o total final
const totalFinal = computed(() => {
    return totalBase.value + totalMarkupAcrescido.value;
});

// [NOVA FUNÇÃO]: Aplica e Salva o Markup
const applyMarkup = async () => {
    if (!confirm(`Confirma aplicar um acréscimo de ${markupPercent.value}% ao valor total?`)) return;
    
    savingMarkup.value = true;
    try {
        const response = await $fetch(`/api/pedidos/${id}/markup`, {
            method: 'PATCH',
            body: { markup_percent: markupPercent.value }
        });
        
        // Atualiza a interface com os novos valores retornados pela API (final_total)
        data.value.final_total = response.updated.final_total;
        alert('Markup salvo e total final atualizado!');

    } catch (e: any) {
        alert(`Erro ao salvar markup: ${e.message || 'Erro de servidor'}`);
    } finally {
        savingMarkup.value = false;
    }
}

// Funções de formatação (mantidas)
const formatarMoeda = (valor: any) => {
    const numero = Number(valor);
    if (isNaN(numero)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
};

const formatarData = (data: string) => {
    if (!data) return 'N/A';
    try {
        return new Date(data).toLocaleDateString('pt-BR');
    } catch {
        return data;
    }
}

const printProposal = () => {
  window.print();
};

// Fetch data (atualizada para buscar o markup salvo)
const fetchData = async () => {
    try {
        const response = await $fetch(`/api/pedidos/${id}`); 
        data.value = response;

        // Se a API retornar o markup salvo, populamos o campo
        if (data.value && data.value.markup_percent) {
            markupPercent.value = parseFloat(data.value.markup_percent);
        }
    } catch (e: any) {
        error.value = e.data || e; 
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

useHead({ 
    title: `Proposta #${id} - ${data.value?.cliente_nome || 'Carregando...'}`,
});
</script>

<style scoped>
@media print {
  .print\:hidden {
    display: none !important;
  }
}
</style>