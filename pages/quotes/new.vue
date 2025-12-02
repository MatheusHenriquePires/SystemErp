<template>
  <DashboardLayout>
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-6 text-slate-800">Novo Orçamento</h1>

      <form @submit.prevent="submitQuote" class="space-y-6">
        
        <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 class="text-xl font-semibold mb-4">Informações Principais</h2>
          <div class="grid grid-cols-2 gap-6">
            
            <div>
              <label class="block text-sm font-medium mb-1">Cliente</label>
              <CustomerSelect v-model="quote.customerId" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Condição de Pagamento</label>
              <input 
                v-model="quote.paymentTerms" 
                class="w-full border p-2 rounded-lg" 
                required 
                placeholder="Ex: 3x Sem Juros / À Vista"
              />
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 class="text-xl font-semibold mb-4 flex justify-between items-center">
            Itens do Orçamento
            <button type="button" @click="addItem" class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              + Adicionar Item
            </button>
          </h2>

          <table class="w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-3 py-2 text-left">Material</th>
                <th class="px-3 py-2 text-right w-20">Qtd.</th>
                <th class="px-3 py-2 text-right w-32">Preço Unitário</th>
                <th class="px-3 py-2 text-right w-32">Total</th>
                <th class="w-10"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in quote.items" :key="index">
                
                <td class="p-2">
                  <input v-model="item.materialName" class="w-full border rounded p-1.5" placeholder="Nome do Material" />
                </td>
                
                <td class="p-2">
                  <input v-model.number="item.quantity" @input="calculateTotal" type="number" step="0.01" class="w-full border rounded p-1.5 text-right" required />
                </td>

                <td class="p-2">
                  <input v-model.number="item.unitPrice" @input="calculateTotal" type="number" step="0.01" class="w-full border rounded p-1.5 text-right" required />
                </td>
                
                <td class="p-2 text-right font-semibold">
                  R$ {{ (item.quantity * item.unitPrice).toFixed(2) }}
                </td>

                <td>
                  <button type="button" @click="removeItem(index)" class="text-red-500 hover:text-red-700">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="mt-6 pt-4 border-t text-right space-y-2">
            <p class="text-2xl font-bold text-slate-800">
              Total Geral: R$ {{ totalGeral.toFixed(2) }}
            </p>
          </div>
        </div>

        <button type="submit" :disabled="isSubmitting" class="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold">
          {{ isSubmitting ? 'Gerando Orçamento...' : 'Gerar e Salvar Orçamento' }}
        </button>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
import CustomerSelect from '~/components/CustomerSelect.vue';

const router = useRouter();

const quote = reactive({
  customerId: '',
  paymentTerms: '3x Sem Juros',
  items: [
    { materialId: 1, materialName: 'Chapa MDF Branca', quantity: 1, unitPrice: 187.50 },
  ],
});

const isSubmitting = ref(false);

const totalGeral = computed(() => {
  return quote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
});

function calculateTotal() {
  // A reatividade lida com o cálculo do Total Geral (computed)
}

function addItem() {
  quote.items.push({ materialId: null, materialName: '', quantity: 1, unitPrice: 0.00 });
}

function removeItem(index) {
  quote.items.splice(index, 1);
}

async function submitQuote() {
  if (totalGeral.value === 0) {
    alert('Adicione itens ao orçamento.');
    return;
  }
  if (!quote.customerId) {
    alert('Selecione um cliente.');
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await $fetch('/api/quotes', {
      method: 'POST',
      body: {
        customerId: quote.customerId,
        paymentTerms: quote.paymentTerms,
        items: quote.items.map(item => ({
          ...item,
          materialId: item.materialId || 1, 
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: item.quantity * item.unitPrice
        }))
      }
    });

    alert(`Orçamento #${response.quoteId} gerado com sucesso! Total: R$ ${response.total.toFixed(2)}`);
    // Redireciona para a página de visualização do orçamento para gerar PDF
    router.push(`/quotes/${response.quoteId}`); 
  } catch (error) {
    console.error(error);
    alert('Erro ao gerar orçamento.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>