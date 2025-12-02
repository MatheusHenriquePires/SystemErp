<template>
  <MainLayout>
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-800">📄 Orçamentos</h1>
        <NuxtLink to="/quotes/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
          + Novo Orçamento
        </NuxtLink>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4 text-left">ID</th>
              <th class="px-6 py-4 text-left">Cliente</th>
              <th class="px-6 py-4 text-left">Data</th>
              <th class="px-6 py-4 text-left">Status</th>
              <th class="px-6 py-4 text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="5" class="px-6 py-8 text-center text-slate-400">Nenhum orçamento encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '~/layouts/DashboardLayout.vue';
useHead({ title: 'Orçamentos - NetMark ERP' });
// Aqui você buscará a lista de orçamentos no futuro
// const { data: quotes } = await useFetch('/api/quotes'); 
</script>