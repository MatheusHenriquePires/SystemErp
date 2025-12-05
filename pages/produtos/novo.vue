<template>
  <DashboardLayout>
    <div class="max-w-2xl mx-auto px-4 py-8">
      
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">✨ Novo Produto</h1>
        <NuxtLink to="/produtos" class="text-gray-500 hover:text-gray-700 font-medium">
          ← Voltar
        </NuxtLink>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <form @submit.prevent="salvarProduto" class="space-y-6">
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto *</label>
            <input 
              v-model="form.nome" 
              type="text" 
              required
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5 border"
              placeholder="Ex: Teclado Mecânico RGB"
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço de Venda (R$) *</label>
              <input 
                v-model="form.preco" 
                type="number" 
                step="0.01" 
                required
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5 border font-mono"
                placeholder="0,00"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço de Custo (R$)</label>
              <input 
                v-model="form.custo" 
                type="number" 
                step="0.01" 
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5 border font-mono"
                placeholder="0,00"
              >
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estoque Inicial</label>
              <input 
                v-model="form.estoque_atual" 
                type="number" 
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5 border"
                placeholder="0"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <input 
                v-model="form.categoria" 
                type="text" 
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5 border"
                placeholder="Ex: Eletrônicos"
              >
            </div>
          </div>

          <div v-if="form.preco > 0" class="bg-gray-50 dark:bg-gray-900 p-4 rounded-md flex justify-between items-center text-sm">
            <span class="text-gray-600 dark:text-gray-400">Margem Estimada:</span>
            <span :class="lucro >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
              {{ formatarMoeda(lucro) }}
            </span>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <NuxtLink to="/produtos" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </NuxtLink>
            <button 
              type="submit" 
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="loading">Salvando...</span>
              <span v-else>Salvar Produto</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';

const router = useRouter();
const loading = ref(false);

const form = ref({
  nome: '',
  preco: '', // String inicialmente para facilitar digitação, depois converte
  custo: '',
  estoque_atual: 0,
  categoria: ''
});

// Calcula lucro em tempo real
const lucro = computed(() => {
  const p = Number(form.value.preco) || 0;
  const c = Number(form.value.custo) || 0;
  return p - c;
});

const formatarMoeda = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const salvarProduto = async () => {
  loading.value = true;
  try {
    await $fetch('/api/produtos', {
      method: 'POST',
      body: {
        ...form.value,
        preco: Number(form.value.preco),
        custo: Number(form.value.custo)
      }
    });

    // Sucesso: Volta para a lista
    router.push('/produtos'); // Altere para a rota exata da sua lista (ex: /estoque ou /produtos)
    
  } catch (error: any) {
    const msg = error.data?.message || 'Erro ao salvar produto.';
    alert(msg);
  } finally {
    loading.value = false;
  }
};

useHead({ title: 'Novo Produto' });
</script>