<template>
  <NuxtLayout name="dashboard-layout">
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">
      
      <div class="flex items-center mb-6">
        <NuxtLink to="/produtos" class="text-blue-600 hover:text-blue-800 mr-4">
            &larr; Voltar
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          ✏️ Editando Produto: {{ form.nome }}
        </h1>
      </div>

      <div class="max-w-xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        
        <div v-if="loading" class="text-center py-10">Carregando dados do produto...</div>
        <div v-else-if="error" class="text-red-500 py-10">Erro ao carregar produto: {{ error.message }}</div>

        <form v-else @submit.prevent="salvarProduto" class="space-y-6">
          
          <div>
            <label for="nome" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
            <input 
              v-model="form.nome" 
              type="text" 
              id="nome" 
              required 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label for="preco" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço de Venda (R$)</label>
            <input 
              v-model.number="form.preco" 
              type="number" 
              step="0.01"
              id="preco" 
              required 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label for="estoque" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque Atual</label>
            <input 
              v-model.number="form.estoque_atual" 
              type="number" 
              id="estoque" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div class="flex justify-end space-x-3">
            <button
              type="submit"
              :disabled="saving"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// Variáveis e hooks do Nuxt/Vue
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const error = ref<any>(null);

// Definição do formulário com tipagem básica
const form = ref({
    nome: '',
    preco: 0,
    estoque_atual: 0,
    tipo: 'produto',
    id: route.params.id as string
});

// 1. Função de busca de dados (usando a API GET que criamos)
const fetchProduto = async () => {
    loading.value = true;
    error.value = null;
    try {
        const produto = await $fetch(`/api/produtos/${form.value.id}`, {
            method: 'GET'
        });
        
        // Popula o formulário com os dados existentes
        form.value = { ...form.value, ...produto };

    } catch (e: any) {
        error.value = e;
        alert(`Erro ao carregar produto: ${e.message}`);
    } finally {
        loading.value = false;
    }
};

// 2. Função de salvamento (usando a API PATCH que criamos)
const salvarProduto = async () => {
    saving.value = true;
    try {
        await $fetch(`/api/produtos/${form.value.id}`, {
            method: 'PATCH',
            body: form.value
        });

        alert('Produto atualizado com sucesso!');
        router.push('/produtos'); // Volta para a lista
    } catch (e: any) {
        alert(`Falha ao salvar: ${e.message || 'Erro de servidor'}`);
    } finally {
        saving.value = false;
    }
};

// Carrega os dados ao montar a página
onMounted(fetchProduto);
useHead({ title: `Editar Produto ${form.value.id}` });
</script>