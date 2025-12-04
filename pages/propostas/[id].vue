<template>
  <NuxtLayout>
    <div class="max-w-4xl mx-auto my-8 p-8 bg-white shadow-xl print:shadow-none print:m-0 print:p-0">
      
      <div class="mb-6 flex justify-between items-center print:hidden">
        <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600">
          &larr; Voltar para Pedidos
        </NuxtLink>
        <button @click="printProposal" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition">
          🖨️ Imprimir / Salvar como PDF
        </button>
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
              Data: {{ formatarData(data.data_criacao) }} </p>
          </div>
          <div class="text-right">
             <p class="font-bold text-lg text-gray-900">{{ data.cliente_nome || 'ARBOREO' }}</p> <p class="text-sm text-gray-500">{{ data.cliente_cidade || 'Cidade não informada' }}</p> </div>
        </header>

        <section class="mb-6 border-b pb-4">
          <h2 class="text-lg font-semibold mb-2">Cliente</h2>
          <div class="grid grid-cols-2 text-sm text-gray-700">
            <div>Nome: <span class="font-medium">{{ data.cliente_nome }}</span></div> <div>Telefone: <span class="font-medium">{{ data.cliente_telefone || 'N/A' }}</span></div> <div>Email: <span class="font-medium">{{ data.cliente_email || 'N/A' }}</span></div> </div>
        </section>

        <section>
          <h2 class="text-lg font-semibold mb-3">Itens Inclusos</h2>
          <div class="space-y-4">
            <div v-for="(item, index) in data.itens" :key="index" class="p-4 border rounded-lg bg-gray-50"> 
              <h3 class="font-bold text-lg text-gray-800">{{ item.descricao || item.name }}</h3> <div class="text-sm text-gray-600 mt-1 space-y-1">
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
                <span class="font-medium">Total dos Itens:</span>
                <span class="font-medium">{{ formatarMoeda(data.total) }}</span> 
              </div>
              
              <div class="flex justify-between text-base font-bold pt-2 border-t mt-2">
                <span>Condições:</span>
                <span class="text-blue-600">{{ data.payment_terms || 'À vista' }}</span> </div>

              <div class="flex justify-between text-xl font-extrabold text-blue-800 pt-4 border-t-2 border-blue-100">
                <span>TOTAL FINAL:</span>
                <span>{{ formatarMoeda(data.total) }}</span> </div>
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

const fetchData = async () => {
    try {
        const response = await $fetch(`/api/pedidos/${id}`); 
        // Se o JSON for um objeto simples (não aninhado), salvamos ele.
        data.value = response; 
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