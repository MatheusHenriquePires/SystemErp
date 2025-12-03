<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
// Seus componentes (verifique se o caminho está certo)
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
    // --- A CORREÇÃO ESTÁ AQUI ---
    const payload = {
      // 1. Mudamos de customerId para cliente_id
      cliente_id: Number(quote.customerId), 
      
      // 2. Adicionamos o Total (senão salva zero)
      total: totalGeral.value,
      
      paymentTerms: quote.paymentTerms,
      status: 'ORCAMENTO', 
      
      // 3. Mantivemos items (se seu backend esperar 'itens', mude aqui também)
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

    // O backend retorna { success: true, id: ... }
    if (response.success) {
      alert(`✅ Pedido criado com sucesso!`);
      router.push('/pedidos'); 
    }

  } catch (error) {
    console.error('Erro:', error);
    // Mostra a mensagem real do erro (ex: "Cliente obrigatório")
    alert(error.data?.message || 'Erro ao salvar o pedido.');
  } finally {
    isSubmitting.value = false;
  }
}

useHead({ title: 'Novo Pedido - NetMark ERP' });
</script>