<template>
  <DashboardLayout>
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-800">Meus Orçamentos</h1>
        <NuxtLink to="/quotes/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Novo
        </NuxtLink>
      </div>

      <div class="bg-white p-6 rounded shadow">
        <p v-if="quotes?.length === 0">Nenhum orçamento encontrado.</p>
        
        <ul v-else>
          <li v-for="q in quotes" :key="q.id" class="border-b p-2">
            Orçamento #{{ q.id }} - R$ {{ q.valor_total }} ({{ q.status }})
          </li>
        </ul>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '~/layouts/DashboardLayout.vue';
const { data: quotes } = await useFetch('/api/quotes');
</script>