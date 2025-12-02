<template>
  <DashboardLayout>
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-2 text-slate-800">Importação de Orçamento</h1>
      <p class="text-slate-500 mb-8">Envie o PDF do seu fornecedor. O sistema irá ler os itens e calcular seus preços de venda.</p>

      <div v-if="step === 1" class="max-w-xl mx-auto mt-12">
        <div 
          class="border-4 border-dashed border-slate-300 rounded-2xl p-16 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer group bg-white"
          @click="$refs.fileInput.click()"
        >
          <div class="text-6xl mb-6 group-hover:scale-110 transition transform">📄</div>
          <h3 class="text-2xl font-bold text-slate-700">Clique para enviar PDF</h3>
          <p class="text-slate-400 mt-2">Suporta orçamentos de fornecedores (.pdf)</p>
          <input type="file" ref="fileInput" class="hidden" accept=".pdf" @change="handleFileSelect" />
        </div>
        
        <div v-if="processing" class="mt-8 text-center bg-white p-4 rounded-lg shadow-sm border border-blue-100">
          <div class="inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p class="text-blue-600 font-bold text-lg">Analisando arquivo...</p>
          <p class="text-slate-400 text-sm">Isso pode levar alguns segundos.</p>
        </div>
      </div>

      <div v-if="step === 2">
        <div class="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 z-10 py-4 border-b border-slate-200">
          <div>
            <h2 class="text-xl font-bold text-slate-800">Revisão: {{ items.length }} itens encontrados</h2>
            <p class="text-sm text-slate-500">Confira os custos e ajuste sua margem antes de importar.</p>
          </div>
          <div class="flex gap-3">
            <button @click="step = 1" class="px-5 py-2 text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium">
              Cancelar
            </button>
            <button 
              @click="salvarTudo" 
              :disabled="saving" 
              class="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-lg flex items-center gap-2 disabled:opacity-50 transition"
            >
              <span v-if="saving" class="animate-spin">⏳</span>
              {{ saving ? 'Salvando...' : 'Confirmar Importação' }}
            </button>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-xs tracking-wider">
              <tr>
                <th class="p-4 text-left">Nome do Produto (Editável)</th>
                <th class="p-4 w-32 text-right">Custo (R$)</th>
                <th class="p-4 w-24 text-center">Margem %</th>
                <th class="p-4 w-32 text-right bg-blue-50 text-blue-800">Venda (R$)</th>
                <th class="p-4 w-10 text-center">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in items" :key="index" class="hover:bg-slate-50 transition group">
                <td class="p-2">
                  <input 
                    v-model="item.name" 
                    class="w-full bg-transparent border border-transparent hover:border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" 
                  />
                </td>
                
                <td class="p-2">
                  <input 
                    v-model.number="item.cost" 
                    @input="recalc(item)"
                    type="number" step="0.01" 
                    class="w-full text-right bg-transparent border border-transparent hover:border-slate-300 rounded px-2 py-1.5" 
                  />
                </td>
                
                <td class="p-2">
                  <input 
                    v-model.number="item.markup" 
                    @input="recalc(item)" 
                    type="number" 
                    class="w-full text-center bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded px-1 py-1.5 focus:ring-2 focus:ring-blue-500" 
                  />
                </td>
                
                <td class="p-2 text-right font-bold text-emerald-600 bg-blue-50/50">
                  R$ {{ (item.cost * (1 + item.markup/100)).toFixed(2) }}
                </td>
                
                <td class="p-2 text-center">
                  <button 
                    @click="items.splice(index, 1)" 
                    class="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition" 
                    title="Remover este item"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="items.length === 0" class="p-12 text-center text-slate-400">
            Nenhum item identificado. Tente outro PDF.
          </div>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
const router = useRouter();

const step = ref(1);
const processing = ref(false);
const saving = ref(false);
const items = ref([]);

// 1. Upload e Processamento
async function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    return alert('Por favor, envie apenas arquivos PDF.');
  }

  processing.value = true;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await $fetch('/api/import/upload', {
      method: 'POST',
      body: formData
    });
    
    if (res.items.length === 0) {
      alert('O sistema leu o PDF mas não encontrou padrões de preço (R$ 0,00). Verifique se o PDF é selecionável (texto) ou uma imagem (scan).');
      processing.value = false;
      return;
    }

    items.value = res.items;
    step.value = 2; 
  } catch (e) {
    console.error(e);
    alert('Erro ao ler o PDF. Tente um arquivo diferente.');
  } finally {
    processing.value = false;
  }
}

// 2. Recalculo visual
function recalc(item) {
  item.price = item.cost * (1 + item.markup/100);
}

// 3. Salvar no Banco (Loop)
async function salvarTudo() {
  if (items.value.length === 0) return;
  saving.value = true;
  
  try {
    // Envia cada item para a API de criação de produtos existente
    for (const item of items.value) {
      await $fetch('/api/produtos', {
        method: 'POST',
        body: {
          nome: item.name,
          preco_custo: item.cost,
          margem_lucro: item.markup,
          preco: item.cost * (1 + item.markup/100), // Manda o preço final calculado
          estoque: 100, // Estoque inicial padrão
          tipo: 'produto'
        }
      });
    }
    
    alert(`Sucesso! ${items.value.length} produtos foram importados para o catálogo.`);
    router.push('/produtos');
  } catch (e) {
    alert('Houve um erro ao salvar alguns itens.');
  } finally {
    saving.value = false;
  }
}
</script>