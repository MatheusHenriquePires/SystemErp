<template>
  <DashboardLayout>
    <div class="p-8 max-w-4xl mx-auto">
      
      <div class="mb-6 flex justify-between no-print">
        <NuxtLink to="/quotes" class="text-gray-500">← Voltar</NuxtLink>
        <button @click="print" class="bg-blue-600 text-white px-6 py-2 rounded font-bold">
          Imprimir
        </button>
      </div>

      <div v-if="dados" class="bg-white p-12 shadow-lg border print-area">
        
        <div class="flex justify-between border-b pb-8 mb-8">
          <div>
            <h1 class="text-2xl font-bold">{{ dados.cabecalho.empresa_nome || 'Agência NetMark' }}</h1>
            <p class="text-gray-500">Orçamento #{{ dados.cabecalho.id }}</p>
            <p class="text-gray-500">{{ new Date(dados.cabecalho.quote_date).toLocaleDateString('pt-BR') }}</p>
          </div>
          <div class="text-right">
            <h2 class="font-bold">Cliente</h2>
            <p>{{ dados.cabecalho.cliente_nome }}</p>
            <p class="text-sm text-gray-500">{{ dados.cabecalho.cliente_email }}</p>
            <p class="text-sm text-gray-500">{{ dados.cabecalho.cliente_telefone }}</p>
          </div>
        </div>

        <table class="w-full mb-8 text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 text-left">Descrição</th>
              <th class="p-2 text-center">Qtd</th>
              <th class="p-2 text-right">Unit.</th>
              <th class="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dados.itens" :key="item.name" class="border-b">
              <td class="p-2">{{ item.name }}</td>
              <td class="p-2 text-center">{{ Number(item.quantity) }}</td>
              <td class="p-2 text-right">R$ {{ Number(item.unit_price).toFixed(2) }}</td>
              <td class="p-2 text-right font-bold">R$ {{ Number(item.total_price).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="text-right text-xl font-bold">
          Total: R$ {{ Number(dados.cabecalho.total_amount).toFixed(2) }}
        </div>
        <div class="text-right text-sm text-gray-500 mt-1">
          Condição: {{ dados.cabecalho.payment_terms }}
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
const route = useRoute();
const { data: dados } = await useFetch(`/api/quotes/${route.params.id}`);

function print() { window.print() }
</script>

<style>
@media print {
  .no-print, aside { display: none !important; }
  .print-area { box-shadow: none; border: none; }
}
</style>