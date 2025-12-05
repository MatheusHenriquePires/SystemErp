<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8">
      
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900">📦 Controle de Estoque</h1>
        <button @click="abrirModal" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow flex items-center gap-2">
          <span>+</span> Novo Produto
        </button>
      </div>

      <div class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produto</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Estoque</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Custo</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Venda</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Lucro</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading">
                <td colspan="6" class="p-6 text-center text-gray-500">Carregando estoque...</td>
              </tr>
              <tr v-else-if="produtos.length === 0">
                <td colspan="6" class="p-6 text-center text-gray-500">Nenhum produto cadastrado.</td>
              </tr>
              
              <tr v-for="prod in produtos" :key="prod.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">#{{ prod.id }}</td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ prod.nome }}</div>
                  <div class="text-xs text-gray-400" v-if="prod.categoria">{{ prod.categoria }}</div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="[
                    'px-2 py-1 text-xs font-bold rounded-full',
                    (prod.estoque_atual || 0) < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  ]">
                    {{ prod.estoque_atual || 0 }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-right text-gray-600">{{ formatarMoeda(prod.custo) }}</td>
                <td class="px-6 py-4 text-sm text-right font-bold text-gray-900">{{ formatarMoeda(prod.preco) }}</td>
                <td class="px-6 py-4 text-sm text-center text-green-600 font-medium">
                  {{ formatarMoeda((prod.preco || 0) - (prod.custo || 0)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="mostrarFormulario" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h2 class="text-xl font-bold mb-4">Novo Produto</h2>
          
          <form @submit.prevent="salvarProduto" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nome do Produto</label>
              <input v-model="novo.nome" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Ex: Câmera Canon">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Custo</label>
                <input v-model="novo.custo" type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Preço Venda</label>
                <input v-model="novo.preco" type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Estoque Atual</label>
              <input v-model="novo.estoque_atual" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button type="button" @click="mostrarFormulario = false" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
              <button type="submit" class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Salvar</button>
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
  id: null as number | null, // Se tiver ID, é edição. Se for null, é novo.
  nome: '',
  custo: 0,
  preco: 0,
  estoque_atual: 0,
  categoria: ''
});

// 1. Carregar Produtos
const carregarProdutos = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/produtos');
    produtos.value = (data as any[]) || [];
  } catch (error) {
    console.error('Erro ao carregar:', error);
  } finally {
    loading.value = false;
  }
};

// 2. Botão "Novo Produto"
const abrirModal = () => {
  novo.value = { id: null, nome: '', custo: 0, preco: 0, estoque_atual: 0, categoria: '' };
  mostrarFormulario.value = true;
};

// 3. Botão "Editar" (Lápis)
const editarProduto = (produto: any) => {
  // Copia os dados do produto clicado para o formulário
  novo.value = { 
      id: produto.id,
      nome: produto.nome,
      custo: Number(produto.custo),
      preco: Number(produto.preco),
      estoque_atual: Number(produto.estoque_atual),
      categoria: produto.categoria
  };
  mostrarFormulario.value = true;
};

// 4. Salvar Inteligente (Cria ou Edita)
const salvarProduto = async () => {
  salvando.value = true;
  try {
    const payload = {
      ...novo.value,
      custo: Number(novo.value.custo),
      preco: Number(novo.value.preco),
      estoque_atual: Number(novo.value.estoque_atual)
    };

    if (novo.value.id) {
        // --- MODO EDIÇÃO (PUT) ---
        await $fetch('/api/produtos', { method: 'PUT', body: payload });
        alert('Produto atualizado com sucesso!');
    } else {
        // --- MODO CRIAÇÃO (POST) ---
        await $fetch('/api/produtos', { method: 'POST', body: payload });
        alert('Produto cadastrado com sucesso!');
    }
    
    mostrarFormulario.value = false;
    await carregarProdutos(); 

  } catch (error: any) {
    const msg = error.data?.message || 'Erro ao salvar';
    alert(msg);
  } finally {
    salvando.value = false;
  }
};

// 5. Excluir
const excluirProduto = async (id: number, nome: string) => {
    if (!confirm(`ATENÇÃO: Deseja excluir "${nome}"?`)) return;
    try {
        await $fetch(`/api/produtos/${id}`, { method: 'DELETE' });
        produtos.value = produtos.value.filter(p => p.id !== id);
    } catch (e: any) {
        const msg = e.data?.message || "Erro ao excluir.";
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