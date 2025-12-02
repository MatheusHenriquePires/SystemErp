<template>
  <DashboardLayout>
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-800">📄 Orçamentos</h1>
        <NuxtLink to="/quotes/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition">
          + Novo Orçamento
        </NuxtLink>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th class="px-6 py-4 font-medium">ID</th>
              <th class="px-6 py-4 font-medium">Cliente</th>
              <th class="px-6 py-4 font-medium">Data</th>
              <th class="px-6 py-4 font-medium">Status</th>
              <th class="px-6 py-4 font-medium text-right">Valor Total</th>
              <th class="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="quote in quotes" :key="quote.id" class="hover:bg-slate-50 transition">
              <td class="px-6 py-4 font-bold text-slate-700">#{{ quote.id }}</td>
              <td class="px-6 py-4">{{ quote.cliente_nome }}</td>
              <td class="px-6 py-4 text-slate-500">
                {{ new Date(quote.data_venda).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase">
                  {{ quote.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right font-bold text-emerald-600">
                R$ {{ Number(quote.valor_total).toFixed(2) }}
              </td>
              <td class="px-6 py-4 text-center">
                <NuxtLink :to="`/quotes/${quote.id}`" class="text-blue-600 hover:underline text-xs font-bold">
               Abrir PDF 📄
             </NuxtLink>
              </td>
            </tr>
            <tr v-if="!quotes || quotes.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                <p class="text-lg">Nenhum orçamento encontrado.</p>
                <p class="text-sm">Clique em "Novo Orçamento" para começar.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';

// Busca os dados da API
const { data: quotes, refresh } = await useFetch('/api/quotes');

// Atualiza a lista sempre que entrar na página
onMounted(() => {
  refresh();
});
</script>