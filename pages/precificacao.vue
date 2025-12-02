<template>
  <div class="flex min-h-screen bg-slate-50 font-sans text-slate-900">
    <MainLayout sidebar-active="/precificacao">
      <div class="p-8">
        <h1 class="text-3xl font-bold mb-2">Gestão de Preços (Parceiro)</h1>
        <p class="text-slate-500 mb-6">Edite sua margem (Markup) para calcular o Preço Final de Venda.</p>
        
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th class="px-6 py-3 font-medium">Item</th>
                <th class="px-6 py-3 font-medium">Preço Parceiro</th>
                <th class="px-6 py-3 font-medium text-center">Markup (%)</th>
                <th class="px-6 py-3 font-medium text-right">Preço Final</th>
                <th class="px-6 py-3 font-medium">Unidade</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="material in materials" :key="material.id">
                <td class="px-6 py-3 font-medium text-slate-900">{{ material.name }}</td>
                <td class="px-6 py-3 text-slate-500">R$ {{ Number(material.partner_price).toFixed(2) }}</td>
                
                <td class="px-6 py-3 text-center">
                  <input 
                    type="number" 
                    step="0.01"
                    v-model.number="material.markup_percent"
                    @blur="updateMarkup(material)"
                    class="border rounded w-20 text-center p-1.5 focus:ring-blue-500"
                  />
                </td>
                
                <td class="px-6 py-3 text-right font-bold text-emerald-600">
                  R$ {{ Number(material.final_price).toFixed(2) }}
                </td>
                <td class="px-6 py-3 text-slate-500">{{ material.unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  </div>
</template>

<script setup>
import MainLayout from '~/layouts/DashboardLayout.vue'; // Reutilizamos o Layout

// 1. Fetch de todos os materiais
const { data: materials, refresh } = await useFetch('/api/materials')

// 2. Função para atualizar o markup e recalcular
async function updateMarkup(material) {
    if (material.markup_percent < 0) material.markup_percent = 0;

    try {
        const updated = await $fetch(`/api/materials/${material.id}`, {
            method: 'PATCH',
            body: { markup_percent: material.markup_percent }
        });

        // Atualiza a linha localmente com o novo preço calculado pelo servidor
        material.final_price = updated.final_price;
        alert('Preço atualizado com sucesso!');
        refresh(); // Atualiza a lista completa
    } catch (e) {
        alert('Falha ao atualizar o preço.');
    }
}
</script>