<template>
  <div class="print-container bg-white min-h-screen p-8 text-slate-800">
    <div class="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
      <div>
        <h1 class="text-3xl font-bold uppercase tracking-wider">
          {{ pedido.status === 'ORCAMENTO' ? 'Orçamento' : 'Pedido de Venda' }}
        </h1>
        <p class="text-slate-500 mt-1">#{{ pedido.id }}</p>
      </div>
      <div class="text-right">
        <h2 class="text-xl font-bold text-blue-800">Agência NetMark</h2>
        <p class="text-sm text-slate-500">contato@agencianetmark.com</p>
        <p class="text-sm text-slate-500">Data: {{ new Date(pedido.data_criacao).toLocaleDateString('pt-BR') }}</p>
      </div>
    </div>

    <div class="mb-8 bg-slate-50 p-4 rounded border border-slate-200">
      <h3 class="font-bold text-slate-700 mb-2 uppercase text-sm">Dados do Cliente</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <p><span class="font-semibold">Nome:</span> {{ pedido.cliente_nome }}</p>
        <p><span class="font-semibold">Email:</span> {{ pedido.cliente_email || '-' }}</p>
        <p><span class="font-semibold">Telefone:</span> {{ pedido.cliente_telefone || '-' }}</p>
        <p><span class="font-semibold">Cidade:</span> {{ pedido.cliente_cidade || '-' }}</p>
      </div>
    </div>

    <table class="w-full mb-8 text-sm">
      <thead class="bg-slate-800 text-white">
        <tr>
          <th class="p-3 text-left">Descrição</th>
          <th class="p-3 text-center w-24">Qtd</th>
          <th class="p-3 text-right w-32">Preço Unit.</th>
          <th class="p-3 text-right w-32">Total</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200">
        <tr v-for="(item, index) in pedido.itens" :key="index">
          <td class="p-3">{{ item.descricao || 'Item Produto' }}</td>
          <td class="p-3 text-center">{{ item.quantidade }}</td>
          <td class="p-3 text-right">{{ formatarMoeda(item.preco_unitario) }}</td>
          <td class="p-3 text-right font-semibold">{{ formatarMoeda(item.quantidade * item.preco_unitario) }}</td>
        </tr>
        <tr v-if="!pedido.itens || pedido.itens.length === 0">
          <td class="p-3 text-slate-500 italic">Detalhes dos itens não listados (Resumo do Pedido)</td>
          <td class="p-3 text-center">-</td>
          <td class="p-3 text-right">-</td>
          <td class="p-3 text-right font-semibold">{{ formatarMoeda(pedido.total) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-end">
      <div class="w-64 bg-slate-100 p-4 rounded">
        <div class="flex justify-between items-center text-xl font-bold text-slate-800">
          <span>Total:</span>
          <span>{{ formatarMoeda(pedido.total) }}</span>
        </div>
      </div>
    </div>

    <div class="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
      <p>Documento gerado eletronicamente em {{ new Date().toLocaleString('pt-BR') }}</p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const pedido = ref({});

const formatarMoeda = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

onMounted(async () => {
  try {
    // Busca os dados
    const data = await $fetch(`/api/pedidos/${route.params.id}`);
    pedido.value = data || {};
    
    // Aguarda um pouquinho para o Vue renderizar e chama a impressão
    setTimeout(() => {
        window.print();
    }, 500);
  } catch (e) {
    alert('Erro ao carregar dados para impressão.');
  }
});

// Layout em branco (sem sidebar/menu) para impressão
definePageMeta({
  layout: false
});
</script>

<style>
/* Força o navegador a esconder cabeçalhos/rodapés automáticos se possível */
@media print {
  @page { margin: 1cm; }
  body { -webkit-print-color-adjust: exact; }
}
</style>