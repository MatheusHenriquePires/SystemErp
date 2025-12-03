<template>
  <DashboardLayout>
    <template #header-actions>
      <NuxtLink to="/pedidos" class="text-gray-500 hover:text-blue-600 transition">
        ← Voltar para Pedidos
      </NuxtLink>
    </template>
    
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-6 text-slate-800">Novo Pedido / Orçamento</h1>

      <form @submit.prevent="submitQuote" class="space-y-6">
        
        <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 class="text-xl font-semibold mb-4 text-slate-700">Informações Principais</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="block text-sm font-medium mb-1 text-slate-600">Cliente</label>
              <CustomerSelect v-model="quote.customerId" />
              <p v-if="!quote.customerId" class="text-xs text-red-500 mt-1">* Selecione um cliente</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1 text-slate-600">Condição de Pagamento</label>
              <input 
                v-model="quote.paymentTerms" 
                class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                required 
                placeholder="Ex: À Vista / 50% Entrada"
              />
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-slate-700">Itens do Pedido</h2>
            <button type="button" @click="addItem" class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm font-medium flex items-center gap-2">
              <span>+</span> Adicionar Item
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-3 py-3 text-left font-medium text-slate-600 w-1/3">Produto / Serviço</th>
                  <th class="px-3 py-3 text-right w-24 font-medium text-slate-600">Qtd.</th>
                  <th class="px-3 py-3 text-right w-36 font-medium text-slate-600">Preço Unit.</th>
                  <th class="px-3 py-3 text-right w-36 font-medium text-slate-600">Total</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, index) in quote.items" :key="index">
                  
                  <td class="p-2 align-top">
                    <ProductSelect 
                      v-model="item.materialId" 
                      @select="(prod) => { 
                        item.materialName = prod.nome; 
                        item.unitPrice = prod.preco; 
                      }" 
                    />
                    <input 
                      v-model="item.materialName" 
                      class="w-full border rounded p-1.5 mt-1 text-xs text-gray-600 focus:ring-blue-500 outline-none" 
                      placeholder="Descrição personalizada do item..." 
                      required
                    />
                  </td>
                  
                  <td class="p-2 align-top">
                    <input 
                      v-model.number="item.quantity" 
                      type="number" step="0.01" min="0"
                      class="w-full border rounded p-2 text-right focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </td>

                  <td class="p-2 align-top">
                    <input 
                      v-model.number="item.unitPrice" 
                      type="number" step="0.01" min="0"
                      class="w-full border rounded p-2 text-right focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </td>
                  
                  <td class="p-2 align-top text-right font-bold text-slate-700 pt-3">
                    R$ {{ (item.quantity * item.unitPrice).toFixed(2) }}
                  </td>

                  <td class="text-center align-top pt-2">
                    <button type="button" @click="removeItem(index)" class="text-red-400 hover:text-red-600 p-1">
                      🗑️
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
            class="bg-blue-600 text-white py-3 px-8 rounded-xl hover:bg-blue-700 font-bold shadow-lg transition transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="isSubmitting" class="animate-spin">⏳</span>
            {{ isSubmitting ? 'Salvando...' : 'Gerar e Salvar Pedido' }}
          </button>
        </div>

      </form>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
import CustomerSelect from '~/components/CustomerSelect.vue';
import ProductSelect from '~/components/ProductSelect.vue';

const router = useRouter();

const quote = reactive({
  customerId: '', 
  paymentTerms: 'À Vista',
  items: [
    { materialId: '', materialName: '', quantity: 1, unitPrice: 0.00 },
  ],
});

const isSubmitting = ref(false);

const totalGeral = computed(() => {
  return quote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
});

function addItem() {
  quote.items.push({ materialId: '', materialName: '', quantity: 1, unitPrice: 0.00 });
}

function removeItem(index) {
  if (quote.items.length > 1) {
    quote.items.splice(index, 1);
  } else {
    quote.items[0] = { materialId: '', materialName: '', quantity: 1, unitPrice: 0.00 };
  }
}

async function submitQuote() {
  if (totalGeral.value <= 0) return alert('O valor total não pode ser zero.');
  if (!quote.customerId) return alert('Selecione um Cliente.');

  isSubmitting.value = true;

  try {
    // PREPARAÇÃO DOS DADOS CORRIGIDA
    const payload = {
      // Backend espera cliente_id, Frontend tinha customerId
      cliente_id: Number(quote.customerId), 
      
      // Enviamos o total calculado
      total: totalGeral.value,
      
      paymentTerms: quote.paymentTerms,
      status: 'ORCAMENTO', 
      
      // Mapeamento dos itens
      items: quote.items.map(item => ({
        materialId: item.materialId ? Number(item.materialId) : null,
        materialName: item.materialName || 'Item avulso',
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }))
    };

    const response = await $fetch('/api/pedidos', { 
      method: 'POST',
      body: payload
    });

    if (response.success) {
      alert(`✅ Pedido criado com sucesso!`);
      router.push('/pedidos'); 
    }

  } catch (error) {
    console.error('Erro:', error);
    alert(error.data?.message || 'Erro ao salvar o pedido.');
  } finally {
    isSubmitting.value = false;
  }
}

useHead({ title: 'Novo Pedido - NetMark ERP' });
</script>