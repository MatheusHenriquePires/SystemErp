<template>
  <DashboardLayout>
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-6 text-slate-800">Novo Orçamento</h1>

      <form @submit.prevent="submitQuote" class="space-y-6">
        
        <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 class="text-xl font-semibold mb-4 text-slate-700">Informações Principais</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="block text-sm font-medium mb-1 text-slate-600">Cliente</label>
              <CustomerSelect v-model="quote.customerId" />
              <p v-if="!quote.customerId" class="text-xs text-red-500 mt-1">* Obrigatório</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-slate-600">Condição de Pagamento</label>
              <input 
                v-model="quote.paymentTerms" 
                class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
                placeholder="Ex: 3x Sem Juros / À Vista / 50% Entrada"
              />
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-slate-700">Itens do Orçamento</h2>
            <button type="button" @click="addItem" class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm font-medium">
              + Adicionar Item
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-3 py-3 text-left font-medium text-slate-600">Descrição do Material / Serviço</th>
                  <th class="px-3 py-3 text-right w-24 font-medium text-slate-600">Qtd.</th>
                  <th class="px-3 py-3 text-right w-36 font-medium text-slate-600">Preço Unit. (R$)</th>
                  <th class="px-3 py-3 text-right w-36 font-medium text-slate-600">Total</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, index) in quote.items" :key="index">
                  
                  <td class="p-2">
                    <input 
                      v-model="item.materialName" 
                      class="w-full border rounded p-2 focus:ring-blue-500 outline-none" 
                      placeholder="Ex: Armário de Cozinha MDF" 
                      required
                    />
                  </td>
                  
                  <td class="p-2">
                    <input 
                      v-model.number="item.quantity" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      class="w-full border rounded p-2 text-right focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </td>

                  <td class="p-2">
                    <input 
                      v-model.number="item.unitPrice" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      class="w-full border rounded p-2 text-right focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </td>
                  
                  <td class="p-2 text-right font-bold text-slate-700">
                    R$ {{ (item.quantity * item.unitPrice).toFixed(2) }}
                  </td>

                  <td class="text-center">
                    <button type="button" @click="removeItem(index)" class="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="mt-6 flex justify-end">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[250px]">
              <div class="flex justify-between items-center text-lg font-bold text-slate-800">
                <span>Total Geral:</span>
                <span class="text-emerald-600">R$ {{ totalGeral.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button 
            type="submit" 
            :disabled="isSubmitting" 
            class="bg-emerald-600 text-white py-3 px-8 rounded-xl hover:bg-emerald-700 font-bold shadow-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="isSubmitting" class="animate-spin">⏳</span>
            {{ isSubmitting ? 'Processando...' : 'Gerar e Salvar Orçamento' }}
          </button>
        </div>

      </form>
    </div>
  </DashboardLayout>
</template>

<script setup>
// Importa explicitamente o Layout e o Componente para garantir que funcione
import DashboardLayout from '~/layouts/DashboardLayout.vue';
import CustomerSelect from '~/components/CustomerSelect.vue';

const router = useRouter();

// Estado do formulário
const quote = reactive({
  customerId: '', // Isso receberá o ID do cliente do <CustomerSelect>
  paymentTerms: 'À Vista',
  items: [
    // Item inicial padrão
    { materialId: null, materialName: '', quantity: 1, unitPrice: 0.00 },
  ],
});

const isSubmitting = ref(false);

// Cálculo automático do total
const totalGeral = computed(() => {
  return quote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
});

// Adicionar nova linha
function addItem() {
  quote.items.push({ materialId: null, materialName: '', quantity: 1, unitPrice: 0.00 });
}

// Remover linha
function removeItem(index) {
  // Impede remover se só tiver 1 item (opcional, mas boa prática)
  if (quote.items.length > 1) {
    quote.items.splice(index, 1);
  } else {
    // Se for o último, apenas limpa
    quote.items[0] = { materialId: null, materialName: '', quantity: 1, unitPrice: 0.00 };
  }
}

// Enviar para o Backend
async function submitQuote() {
  // Validações Básicas
  if (totalGeral.value <= 0) {
    alert('O valor total do orçamento não pode ser zero.');
    return;
  }
  if (!quote.customerId) {
    alert('Por favor, selecione um Cliente.');
    return;
  }

  isSubmitting.value = true;

  try {
    // Prepara o objeto para enviar, garantindo que NÚMEROS sejam NÚMEROS
    // Isso evita o erro 500 no banco de dados
    const payload = {
      customerId: Number(quote.customerId), // Converte string "5" para numero 5
      paymentTerms: quote.paymentTerms,
      items: quote.items.map(item => ({
        materialId: item.materialId ? Number(item.materialId) : null,
        materialName: item.materialName || 'Item sem nome',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }))
    };

    console.log('Enviando dados:', payload); // Debug no console do navegador

    const response = await $fetch('/api/quotes', {
      method: 'POST',
      body: payload
    });

    if (response.success) {
      alert(`✅ Orçamento #${response.quoteId} salvo com sucesso!`);
      // Redireciona para a lista ou visualização (ajuste conforme necessário)
      router.push('/quotes'); 
    }

  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('❌ Erro ao salvar orçamento. Verifique se todos os campos estão preenchidos.');
  } finally {
    isSubmitting.value = false;

  }
}
// Forçando atualização do Git
</script>