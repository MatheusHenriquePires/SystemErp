<template>
  <DashboardLayout>
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-800">Orçamentos</h1>
        <NuxtLink to="/quotes/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
          + Novo
        </NuxtLink>
      </div>

      <div class="bg-white border rounded-xl shadow overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 border-b">
            <tr>
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">Cliente</th>
              <th class="px-6 py-3">Data</th>
              <th class="px-6 py-3 text-right">Total</th>
              <th class="px-6 py-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in quotes" :key="q.id" class="border-b hover:bg-slate-50">
              <td class="px-6 py-3 font-bold">#{{ q.id }}</td>
              <td class="px-6 py-3">{{ q.cliente_nome }}</td>
              <td class="px-6 py-3">{{ new Date(q.quote_date).toLocaleDateString('pt-BR') }}</td>
              <td class="px-6 py-3 text-right font-bold text-green-600">
                R$ {{ Number(q.total_amount).toFixed(2) }}
              </td>
              <td class="px-6 py-3 text-center">
                <NuxtLink :to="`/quotes/${q.id}`" class="text-blue-600 font-bold hover:underline">
                  Abrir PDF
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="!quotes?.length">
              <td colspan="5" class="p-8 text-center text-gray-500">Nada encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
const { data: quotes, refresh } = await useFetch('/api/quotes');

onMounted(() => refresh());
</script>