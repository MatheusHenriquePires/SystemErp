<template>
  <NuxtLayout name="dashboard-layout">
    
    <template #header-actions>
      <div class="flex gap-2">
        <input 
          type="file" 
          ref="fileInput" 
          class="hidden" 
          accept=".pdf" 
          @change="processarArquivo"
        />

        <button 
          @click="triggerFileInput"
          :disabled="importando"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
        >
          <span v-if="importando">⏳ Processando...</span>
          <span v-else>📄 Importar PDF</span>
        </button>

        <NuxtLink to="/produtos/novo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center">
          + Novo Manual
        </NuxtLink>
      </div>
    </template>
    
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">
      
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">📦 Catálogo de Produtos</h1>
      </div>

      <div v-if="importando" class="mb-6 bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-200">
        <p class="font-bold">Lendo nota fiscal com IA e cadastrando produtos...</p>
        <p class="text-sm">Isso pode levar alguns segundos. Por favor, aguarde.</p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-slate-200 dark:border-gray-700">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preço Venda</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Margem</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estoque</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              
              <tr v-if="loading">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Carregando catálogo...</td>
              </tr>
              <tr v-else-if="produtos.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Nenhum produto encontrado. Clique em "Importar PDF" ou crie um novo.
                  </td>
              </tr>
              
              <template v-else>
                  <tr v-for="produto in produtos" :key="produto.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                          {{ produto.nome }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                          {{ formatarMoeda(produto.preco) }}
                      </td>
                       <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          40%
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span :class="{'text-red-500 font-bold': produto.estoque < 10, 'text-gray-700 dark:text-gray-300': produto.estoque >= 10}">
                              {{ produto.estoque || 0 }}
                          </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <NuxtLink :to="`/produtos/${produto.id}/editar`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                              Editar
                          </NuxtLink>
                      </td>
                  </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const loading = ref(true);
const importando = ref(false);
const produtos = ref<any[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

// Formatação de Moeda
const formatarMoeda = (valor: any) => {
  const numero = Number(valor);
  if (isNaN(numero)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
};

// Carregar lista de produtos
const carregarProdutos = async () => {
  try {
    const data = await $fetch('/api/produtos'); 
    produtos.value = data || [];
  } catch (e) {
    console.error("Erro ao buscar produtos:", e);
    produtos.value = [];
  } finally {
    loading.value = false;
  }
};

// Aciona o clique no input hidden
const triggerFileInput = () => {
  fileInput.value?.click();
};

// Processa o Upload e Salva no Banco
const processarArquivo = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  importando.value = true;

  try {
    // 1. Envia PDF para IA ler
    const respostaIA: any = await $fetch('/api/importar-pdf', {
      method: 'POST',
      body: formData
    });

    if (respostaIA.sucesso && respostaIA.produtos) {
      // 2. Salva cada produto retornado no banco
      // Como a API importar-pdf apenas lê, precisamos chamar a API de salvar para cada item
      let salvos = 0;
      for (const item of respostaIA.produtos) {
        try {
          await $fetch('/api/produtos', {
            method: 'POST',
            body: {
              nome: item.nome,
              preco: item.preco_venda, // Usa o preço sugerido pela IA
              estoque: 10, // Estoque padrão inicial
              tipo: 'produto'
            }
          });
          salvos++;
        } catch (err) {
          console.error(`Erro ao salvar produto ${item.nome}`, err);
        }
      }
      alert(`${salvos} produtos importados com sucesso!`);
      await carregarProdutos(); // Recarrega a tabela
    } else {
      alert('Erro na leitura do PDF: ' + (respostaIA.erro || 'Desconhecido'));
    }

  } catch (e: any) {
    console.error(e);
    alert('Falha na importação. Verifique o console.');
  } finally {
    importando.value = false;
    if (fileInput.value) fileInput.value.value = ''; // Limpa o input para poder selecionar o mesmo arquivo se quiser
  }
};

onMounted(carregarProdutos);
useHead({ title: 'Produtos - NetMark ERP' });
</script>