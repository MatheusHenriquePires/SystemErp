<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8">
      
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">📦 Catálogo de Produtos</h1>
        
        <button @click="abrirModal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow flex items-center gap-2 transition hover:scale-105">
          <span>+</span> Novo Produto
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Produto</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Estoque</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Custo</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Venda</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td colspan="6" class="p-6 text-center text-gray-500">Carregando estoque...</td>
              </tr>
              <tr v-else-if="produtos.length === 0">
                <td colspan="6" class="p-6 text-center text-gray-500">Nenhum produto cadastrado.</td>
              </tr>
              
              <tr v-for="prod in produtos" :key="prod.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                <td class="px-6 py-4 text-sm text-gray-500">#{{ prod.id }}</td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ prod.nome }}</div>
                  <div class="text-xs text-gray-400" v-if="prod.categoria">{{ prod.categoria }}</div>
                </td>
                
                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'px-2 py-1 text-xs font-bold rounded-full',
                    (prod.estoque_atual || 0) < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  ]">
                    {{ prod.estoque_atual || 0 }} un
                  </span>
                </td>

                <td class="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">{{ formatarMoeda(prod.custo) }}</td>
                <td class="px-6 py-4 text-sm text-right font-bold text-emerald-600">{{ formatarMoeda(prod.preco) }}</td>
                
                <td class="px-6 py-4 text-center">
                  <button @click="excluirProduto(prod.id, prod.nome)" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition" title="Excluir">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="mostrarFormulario" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all">
          
          <div class="flex justify-between items-center mb-5">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">✨ Novo Produto</h2>
            <button @click="mostrarFormulario = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <form @submit.prevent="salvarProduto" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Produto</label>
              <input v-model="novo.nome" type="text" required class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm border p-2.5" placeholder="Ex: Câmera Canon">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Custo (R$)</label>
                <input v-model="novo.custo" type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm border p-2.5">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Venda (R$)</label>
                <input v-model="novo.preco" type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm border p-2.5 font-bold text-emerald-600">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque</label>
                <input v-model="novo.estoque_atual" type="number" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm border p-2.5">
              </div>
              <div>
                 <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                 <input v-model="novo.categoria" type="text" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm border p-2.5" placeholder="Ex: Eletrônicos">
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-700">
              <button type="button" @click="mostrarFormulario = false" class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200">Cancelar</button>
              <button type="submit" class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm flex items-center gap-2">
                <span v-if="salvando">💾...</span>
                <span v-else>Salvar</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';

const produtos = ref<any[]>([]);
const loading = ref(true);
const salvando = ref(false);
const mostrarFormulario = ref(false);

// Estado do formulário
const novo = ref({
  nome: '',
  custo: 0,
  preco: 0,
  estoque_atual: 0,
  categoria: ''
});

// --- 1. Carregar Produtos ---
const carregarProdutos = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/produtos');
    produtos.value = (data as any[]) || [];
  } catch (error) {
    console.error('Erro ao carregar estoque:', error);
  } finally {
    loading.value = false;
  }
};

// --- 2. Abrir Modal Limpo ---
const abrirModal = () => {
  novo.value = { nome: '', custo: 0, preco: 0, estoque_atual: 0, categoria: '' };
  mostrarFormulario.value = true;
};

// --- 3. Salvar (POST) ---
const salvarProduto = async () => {
  salvando.value = true;
  try {
    // Convertemos para Number para garantir que o banco receba números
    const payload = {
      ...novo.value,
      custo: Number(novo.value.custo),
      preco: Number(novo.value.preco),
      estoque_atual: Number(novo.value.estoque_atual)
    };

    await $fetch('/api/produtos', {
      method: 'POST',
      body: payload
    });
    
    mostrarFormulario.value = false;
    await carregarProdutos(); // Atualiza a lista
    // Feedback visual rápido
    alert('Produto cadastrado com sucesso!');

  } catch (error: any) {
    const msg = error.data?.message || error.data?.statusMessage || 'Erro ao salvar';
    alert(msg);
  } finally {
    salvando.value = false;
  }
};

// --- 4. Excluir (DELETE) ---
const excluirProduto = async (id: number, nome: string) => {
    if (!confirm(`ATENÇÃO: Deseja excluir "${nome}"?`)) return;

    try {
        await $fetch(`/api/produtos/${id}`, { method: 'DELETE' });
        // Remove da tela imediatamente
        produtos.value = produtos.value.filter(p => p.id !== id);
    } catch (e: any) {
        // Mostra a mensagem de erro do backend (ex: "Produto já tem vendas")
        const msg = e.data?.message || e.data?.statusMessage || "Erro ao excluir.";
        alert(msg);
    }
};

const formatarMoeda = (valor: any) => {
  const num = Number(valor);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(num) ? 0 : num);
};

onMounted(carregarProdutos);
useHead({ title: 'Controle de Estoque' });
</script>