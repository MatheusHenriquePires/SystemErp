<template>
  <DashboardLayout>
    <div class="p-8 max-w-4xl mx-auto">
      
      <div class="mb-8 flex justify-between items-center no-print">
        <NuxtLink to="/quotes" class="text-slate-500 hover:text-slate-700 flex items-center gap-2">
          ← Voltar
        </NuxtLink>
        <button @click="imprimir" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      <div class="bg-white p-12 shadow-2xl rounded-sm border border-gray-200 print-area" id="documento">
        
        <div class="flex justify-between items-start mb-12 border-b pb-8">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 mb-2">{{ quote?.empresa_nome }}</h1>
            <p class="text-slate-500 text-sm">Orçamento #{{ quote?.id }}</p>
            <p class="text-slate-500 text-sm">Data: {{ new Date(quote?.quote_date).toLocaleDateString() }}</p>
          </div>
          <div class="text-right">
            <h2 class="text-lg font-bold text-slate-700">Cliente</h2>
            <p class="text-slate-600">{{ quote?.cliente_nome }}</p>
            <p class="text-slate-500 text-sm">{{ quote?.cliente_email }}</p>
            <p class="text-slate-500 text-sm">{{ quote?.cliente_telefone }}</p>
          </div>
        </div>

        <table class="w-full mb-8">
          <thead class="bg-slate-50 text-slate-600 border-b-2 border-slate-200">
            <tr>
              <th class="py-3 text-left pl-4">Descrição</th>
              <th class="py-3 text-center">Qtd</th>
              <th class="py-3 text-right">Unitário</th>
              <th class="py-3 text-right pr-4">Total</th>
            </tr>
          </thead>
          <tbody class="text-slate-700 text-sm">
            <tr v-for="item in quote?.items" :key="item.name" class="border-b border-slate-100">
              <td class="py-3 pl-4 font-medium">{{ item.name }}</td>
              <td class="py-3 text-center">{{ item.quantity }}</td>
              <td class="py-3 text-right">R$ {{ Number(item.unit_price).toFixed(2) }}</td>
              <td class="py-3 text-right pr-4 font-bold">R$ {{ Number(item.total_price).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-end pt-4">
          <div class="w-1/2">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-slate-600">Condição de Pagamento:</span>
              <span class="font-medium">{{ quote?.payment_terms }}</span>
            </div>
            <div class="flex justify-between py-4 text-xl font-bold text-slate-900">
              <span>Total Geral:</span>
              <span>R$ {{ Number(quote?.total_amount).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-16 pt-8 border-t text-center text-slate-400 text-xs">
          <p>Documento gerado eletronicamente por NetMark ERP.</p>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
const route = useRoute();
const { data: quote } = await useFetch(`/api/quotes/${route.params.id}`);

function imprimir() {
  window.print();
}
</script>

<style>
/* O SEGREDO DO PDF: Esconde tudo que não é o documento na hora de imprimir */
@media print {
  body * {
    visibility: hidden;
  }
  .print-area, .print-area * {
    visibility: visible;
  }
  .print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none;
    box-shadow: none;
  }
  /* Esconde menu lateral, botões e barras do layout */
  aside, .no-print {
    display: none !important;
  }
}
</style>