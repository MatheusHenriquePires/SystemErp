<template>
  <div class="print-container bg-white min-h-screen text-slate-800 font-sans">
    
    <div class="flex justify-between items-start mb-12">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-blue-900 text-white flex items-center justify-center rounded-lg font-bold text-2xl">
          NM
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Agência NetMark</h2>
          <div class="text-sm text-slate-500 flex flex-col">
            <span>contato@agencianetmark.com</span>
            <span>(00) 0000-0000</span>
            <span>Teresina - PI</span> 
          </div>
        </div>
      </div>

      <div class="text-right">
        <h1 class="text-4xl font-extrabold text-slate-900 uppercase tracking-wide">
          {{ pedido.status === 'ORCAMENTO' || pedido.status === 'PROPOSTA' ? 'Orçamento' : 'Venda' }}
        </h1>
        <p class="text-blue-600 font-medium text-lg mt-1">#{{ String(pedido.id).padStart(6, '0') }}</p>
        
        <div class="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
             :class="pedido.status === 'ORCAMENTO' || pedido.status === 'PROPOSTA'
               ? 'bg-amber-100 text-amber-700'
               : 'bg-green-100 text-green-700'">
          {{ pedido.status === 'ORCAMENTO' || pedido.status === 'PROPOSTA' ? 'Em Análise' : 'Confirmado' }}
        </div>
      </div>
    </div>

    <div class="h-1 bg-gradient-to-r from-blue-900 to-blue-600 w-full mb-8 rounded"></div>

    <!-- ITENS -->
    <div class="mb-8">
      <table class="w-full text-sm text-left">
        <thead>
          <tr class="border-b-2 border-slate-800">
            <th class="py-3">Descrição</th>
            <th class="py-3 text-center w-24">Qtd.</th>
            <th class="py-3 text-right w-32">Preço Unit.</th>
            <th class="py-3 text-right w-32">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in pedido.itens" :key="index">
            <td class="py-2">{{ item.descricao }}</td>
            <td class="text-center">{{ item.quantidade }}</td>
            <td class="text-right">{{ formatarMoeda(item.preco_unitario) }}</td>
            <td class="text-right font-bold">
              {{ formatarMoeda(item.quantidade * item.preco_unitario) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ✅ TOTAIS (REGRA CORRETA) -->
    <div class="flex justify-end mb-16">
      <div class="w-72">
        <div class="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>{{ formatarMoeda(pedido.total) }}</span>
        </div>

        <div class="flex justify-between items-center pt-4">
          <span class="text-xl font-bold text-slate-900">Total Final</span>

          <!-- ✅ USO CORRETO: -->
          <span class="text-2xl font-extrabold text-blue-800">
            {{
              pedido.status === 'VENDA' || pedido.status === 'PAGO'
                ? formatarMoeda(pedido.final_total)
                : formatarMoeda(pedido.total)
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="border-t border-slate-200 pt-6 flex justify-between text-xs text-slate-400">
      <p>Agência NetMark</p>
      <p>Processado em {{ new Date().toLocaleString('pt-BR') }}</p>
    </div>

  </div>
</template>

<script setup>
const route = useRoute()

const pedido = ref({
  itens: [],
  total: 0,
  final_total: 0,
  status: '',
  data_criacao: new Date()
})

const formatarMoeda = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(Number(val || 0))

onMounted(async () => {
  try {
    const data = await $fetch(`/api/pedidos/${route.params.id}`)
    if (data) pedido.value = data

    setTimeout(() => {
      window.print()
    }, 700)
  } catch (e) {
    alert('Erro ao carregar impressão')
  }
})

definePageMeta({ layout: false })
</script>

<style scoped>
@media print {
  @page { margin: 0; size: A4; }
  .print-container { padding: 2.5cm; }
}

@media screen {
  .print-container {
    max-width: 210mm;
    margin: 40px auto;
    padding: 20px 40px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
  }
}
</style>
