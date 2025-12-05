<template>
  <DashboardLayout>
    <div class="max-w-6xl mx-auto px-4 py-8">
      
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900">✨ Nova Venda (Estoque)</h1>
        <NuxtLink to="/pedidos" class="text-gray-500 hover:text-gray-700 font-medium">← Voltar</NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 space-y-6">
          
          <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 class="text-lg font-bold mb-4 text-gray-800 border-b pb-2">1. Dados do Cliente</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select v-model="form.cliente_id" class="w-full border rounded-md p-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option :value="null">Selecione...</option>
                  <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
                </select>
                <p v-if="clientes.length === 0" class="text-xs text-red-500 mt-1">Nenhum cliente cadastrado.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Venda</label>
                <select v-model="form.status" class="w-full border rounded-md p-2 bg-gray-50">
                  <option value="ORCAMENTO">📝 Orçamento (Reserva)</option>
                  <option value="VENDA">📦 Venda Finalizada</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 class="text-lg font-bold mb-4 text-gray-800 border-b pb-2">2. Itens do Pedido</h2>
            
            <div class="flex flex-col md:flex-row gap-3 items-end mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
              <div class="flex-grow w-full">
                <label class="block text-xs font-bold text-blue-800 mb-1">Buscar Produto</label>
                <select v-model="itemTemp.produto" class="w-full border rounded-md p-2" @change="atualizarPrecoTemp">
                  <option :value="null">Selecione um produto...</option>
                  <option v-for="prod in estoque" :key="prod.id" :value="prod">
                    {{ prod.nome }} | R$ {{ prod.preco }} (Est: {{ prod.estoque_atual }})
                  </option>
                </select>
              </div>
              
              <div class="w-24">
                <label class="block text-xs font-bold text-blue-800 mb-1">Qtd</label>
                <input v-model.number="itemTemp.quantidade" type="number" min="1" class="w-full border rounded-md p-2 text-center">
              </div>

              <div class="w-32">
                <label class="block text-xs font-bold text-blue-800 mb-1">Preço Un.</label>
                <input v-model.number="itemTemp.preco" type="number" step="0.01" class="w-full border rounded-md p-2 text-right">
              </div>

              <button @click="adicionarItem" :disabled="!itemTemp.produto" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold disabled:opacity-50 transition">
                + Add
              </button>
            </div>

            <div v-if="form.itens.length > 0" class="overflow-hidden rounded-lg border border-gray-200">
              <table class="w-full text-sm">
                <thead class="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th class="p-3 text-left">Produto</th>
                    <th class="p-3 text-center">Qtd</th>
                    <th class="p-3 text-right">Preço</th>
                    <th class="p-3 text-right">Subtotal</th>
                    <th class="p-3 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(item, index) in form.itens" :key="index" class="hover:bg-gray-50">
                    <td class="p-3 font-medium text-gray-800">{{ item.nome }}</td>
                    <td class="p-3 text-center bg-gray-50 font-mono">{{ item.quantidade }}</td>
                    <td class="p-3 text-right text-gray-600">{{ formatarMoeda(item.preco) }}</td>
                    <td class="p-3 text-right font-bold text-blue-600">{{ formatarMoeda(item.total) }}</td>
                    <td class="p-3 text-center">
                      <button @click="removerItem(index)" class="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50">✕</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p v-else class="text-center text-gray-400 py-8 border-2 border-dashed rounded-lg bg-gray-50">
              Nenhum item adicionado. Selecione acima.
            </p>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white p-6 rounded-lg shadow border border-gray-200 sticky top-4">
            <h2 class="text-lg font-bold mb-4 text-gray-800">Resumo do Pedido</h2>
            
            <div class="space-y-2 text-sm text-gray-600 border-b pb-4 mb-4">
              <div class="flex justify-between">
                <span>Itens:</span>
                <span>{{ form.itens.length }}</span>
              </div>
              <div class="flex justify-between">
                <span>Status:</span>
                <span class="font-bold text-blue-600">{{ form.status }}</span>
              </div>
            </div>
            
            <div class="flex justify-between items-center mb-6">
              <span class="text-gray-600 text-lg">Total:</span>
              <span class="text-3xl font-bold text-gray-900">{{ formatarMoeda(totalGeral) }}</span>
            </div>

            <button 
              @click="salvarPedido" 
              :disabled="salvando || form.itens.length === 0 || !form.cliente_id"
              class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
            >
              <span v-if="salvando">💾 Processando...</span>
              <span v-else>✅ Finalizar Venda</span>
            </button>
            
            <div class="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200">
              ℹ️ Ao finalizar, o estoque dos produtos selecionados será reduzido automaticamente.
            </div>
          </div>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';
const router = useRouter();

// Estados
const salvando = ref(false);
const clientes = ref<any[]>([]);
const estoque = ref<any[]>([]);

const form = ref({
  cliente_id: null,
  status: 'ORCAMENTO',
  itens: [] as any[]
});

const itemTemp = ref({
  produto: null as any,
  quantidade: 1,
  preco: 0
});

// Carrega Clientes e Estoque ao iniciar
onMounted(async () => {
  try {
    const [cliData, prodData] = await Promise.all([
      $fetch('/api/clientes'),
      $fetch('/api/produtos') // Reusa a API de produtos que já fizemos
    ]);
    clientes.value = cliData as any[];
    estoque.value = prodData as any[];
  } catch (e) {
    console.error('Erro ao carregar dados', e);
  }
});

// Atualiza o preço quando escolhe o produto no select
const atualizarPrecoTemp = () => {
  if (itemTemp.value.produto) {
    itemTemp.value.preco = Number(itemTemp.value.produto.preco) || 0;
  }
};

const adicionarItem = () => {
  const { produto, quantidade, preco } = itemTemp.value;
  if (!produto) return;

  // Adiciona ao carrinho
  form.value.itens.push({
    id: produto.id,
    nome: produto.nome,
    quantidade: quantidade,
    preco: preco,
    total: quantidade * preco
  });

  // Limpa seleção para o próximo
  itemTemp.value.produto = null;
  itemTemp.value.quantidade = 1;
  itemTemp.value.preco = 0;
};

const removerItem = (index: number) => {
  form.value.itens.splice(index, 1);
};

const totalGeral = computed(() => {
  return form.value.itens.reduce((acc, item) => acc + item.total, 0);
});

const salvarPedido = async () => {
  salvando.value = true;
  try {
    await $fetch('/api/pedidos', {
      method: 'POST',
      body: {
        cliente_id: form.value.cliente_id,
        status: form.value.status,
        valor_total: totalGeral.value,
        itens: form.value.itens
      }
    });

    alert('Venda realizada com sucesso!');
    router.push('/pedidos'); 

  } catch (error: any) {
    alert(error.data?.message || 'Erro ao salvar pedido');
  } finally {
    salvando.value = false;
  }
};

const formatarMoeda = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

useHead({ title: 'Nova Venda' });
</script>