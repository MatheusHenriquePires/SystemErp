<template>
  <NuxtLayout name="dashboard-layout">
    
    <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8">
      
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          📦 Catálogo de Produtos
        </h1>

        <div class="flex gap-2">
            <input type="file" ref="fileInput" class="hidden" accept=".pdf" @change="processarArquivo" />

            <button @click="triggerFileInput" :disabled="importando" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50">
              <span v-if="importando">⏳ Processando...</span>
              <span v-else>📄 Importar PDF (IA)</span>
            </button>

            <NuxtLink to="/produtos/novo" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center">
              + Novo Manual
            </NuxtLink>
        </div>
      </div>

      <div v-if="importando" class="mb-6 bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-200 animate-pulse">
        <p class="font-bold text-lg">🤖 Lendo nota fiscal com IA...</p>
        <p>Aguarde, estamos cadastrando os produtos no banco de dados...</p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-slate-200 dark:border-gray-700">
        <div class="min-w-full overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preço</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estoque</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              
              <tr v-if="loading">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Carregando...</td>
              </tr>
              <tr v-else-if="produtos.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Nenhum produto. Use os botões acima para cadastrar.
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
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span :class="{'text-red-500 font-bold': (produto.estoque_atual || 0) < 10}">
                              {{ produto.estoque_atual ?? produto.estoque ?? 0 }}
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

const formatarMoeda = (valor: any) => {
  const numero = Number(valor);
  if (isNaN(numero)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
};

const carregarProdutos = async () => {
  try {
    const data = await $fetch('/api/produtos'); 
    produtos.value = data || [];
  } catch (e) {
    produtos.value = [];
  } finally {
    loading.value = false;
  }
};

const triggerFileInput = () => fileInput.value?.click();

const processarArquivo = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;

  const file = target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  importando.value = true;

  try {
    const respostaIA: any = await $fetch('/api/importar-pdf', { method: 'POST', body: formData });

    if (respostaIA.sucesso && respostaIA.produtos) {
      let salvos = 0;
      for (const item of respostaIA.produtos) {
        try {
           let precoLimpo = item.preco_venda;
           if (typeof item.preco_venda === 'string') {
              precoLimpo = parseFloat(item.preco_venda.replace(/[^\d,.-]/g, '').replace(',', '.'));
           }

           await $fetch('/api/produtos', {
            method: 'POST',
            body: {
              nome: item.nome,
              preco: precoLimpo,
              estoque: 10, // Vai ser salvo em estoque_atual agora
              tipo: 'produto'
            }
          });
          salvos++;
        } catch (err) { console.error(err); }
      }
      alert(`Sucesso! ${salvos} produtos importados.`);
      await carregarProdutos();
    } else {
      alert('A IA não conseguiu ler produtos neste PDF.');
    }
  } catch (e) {
    alert('Erro ao processar importação.');
  } finally {
    importando.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

onMounted(carregarProdutos);
useHead({ title: 'Produtos - NetMark ERP' });
</script>