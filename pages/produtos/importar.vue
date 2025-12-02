<template>
  <DashboardLayout>
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-2">Importar Tabela de Fornecedor</h1>
      <p class="text-slate-500 mb-8">Envie o PDF do orçamento para cadastrar os produtos e definir seus preços automaticamente.</p>

      <div v-if="step === 1" class="max-w-xl mx-auto mt-12">
        <div 
          class="border-4 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-blue-400 transition cursor-pointer bg-slate-50"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @click="$refs.fileInput.click()"
        >
          <div class="text-6xl mb-4">📄</div>
          <h3 class="text-xl font-bold text-slate-700">Clique ou arraste o PDF aqui</h3>
          <p class="text-slate-400 mt-2">Suporta arquivos .pdf</p>
          <input type="file" ref="fileInput" class="hidden" accept=".pdf" @change="handleFileSelect" />
        </div>
        
        <div v-if="processing" class="mt-6 text-center text-blue-600 font-bold animate-pulse">
          Lendo arquivo e extraindo dados...
        </div>
      </div>

      <div v-if="step === 2">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Revisão de Itens ({{ items.length }} encontrados)</h2>
          <div class="space-x-2">
            <button @click="step = 1" class="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button @click="salvarTudo" :disabled="saving" class="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg">
              {{ saving ? 'Salvando...' : 'Confirmar Importação' }}
            </button>
          </div>
        </div>

        <div class="bg-white border rounded-xl shadow overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b">
              <tr class="text-left text-slate-600">
                <th class="p-3">Nome do Produto (Editável)</th>
                <th class="p-3 w-32">Custo (R$)</th>
                <th class="p-3 w-32">Margem (%)</th>
                <th class="p-3 w-32 text-right">Venda (R$)</th>
                <th class="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="index" class="border-b hover:bg-blue-50">
                <td class="p-2">
                  <input v-model="item.name" class="w-full bg-transparent border-none focus:ring-0 font-medium" />
                </td>
                <td class="p-2">
                  <input v-model.number="item.cost" type="number" step="0.01" class="w-full border rounded p-1" />
                </td>
                <td class="p-2">
                  <input v-model.number="item.markup" @input="recalc(item)" type="number" class="w-full border rounded p-1 text-center font-bold text-blue-600" />
                </td>
                <td class="p-2 text-right font-bold text-emerald-600">
                  R$ {{ (item.cost * (1 + item.markup/100)).toFixed(2) }}
                </td>
                <td class="p-2 text-center cursor-pointer text-red-400" @click="items.splice(index, 1)">x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';

const step = ref(1);
const processing = ref(false);
const saving = ref(false);
const items = ref([]);
const fileInput = ref(null);
const router = useRouter();

// Processamento do Arquivo
async function processFile(file) {
  if (file.type !== 'application/pdf') return alert('Apenas PDF!');
  
  processing.value = true;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await $fetch('/api/import/upload', {
      method: 'POST',
      body: formData
    });
    
    if (res.items.length === 0) {
      alert('Não consegui ler itens. O PDF pode ser uma imagem ou ter formato complexo.');
      processing.value = false;
      return;
    }

    items.value = res.items;
    step.value = 2; // Vai para a tela de revisão
  } catch (e) {
    alert('Erro ao processar PDF.');
  } finally {
    processing.value = false;
  }
}

// Handlers de Upload
function handleFileSelect(e) {
  if (e.target.files[0]) processFile(e.target.files[0]);
}
function handleDrop(e) {
  if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
}

// Recalculo visual (Embora o template já faça, é bom ter controle)
function recalc(item) {
  // Apenas garante reatividade se necessário
}

// Salvar no Banco
async function salvarTudo() {
  saving.value = true;
  try {
    // Vamos usar a API de produtos existente, chamando-a várias vezes ou criando uma de lote
    // Aqui faremos um loop simples para o MVP
    for (const item of items.value) {
      await $fetch('/api/produtos', {
        method: 'POST',
        body: {
          nome: item.name,
          preco_custo: item.cost,
          margem_lucro: item.markup,
          preco: item.cost * (1 + item.markup/100), // Envia o preço final calculado
          estoque: 0,
          tipo: 'produto'
        }
      });
    }
    
    alert('Importação concluída com sucesso!');
    router.push('/produtos');
  } catch (e) {
    alert('Erro ao salvar alguns produtos.');
  } finally {
    saving.value = false;
  }
}
</script>