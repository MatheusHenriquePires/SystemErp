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
          {{ pedido.status === 'ORCAMENTO' ? 'Orçamento' : 'Pedido' }}
        </h1>
        <p class="text-blue-600 font-medium text-lg mt-1">#{{ String(pedido.id).padStart(6, '0') }}</p>
        
        <div class="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
             :class="pedido.status === 'ORCAMENTO' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">
             {{ pedido.status === 'ORCAMENTO' ? 'Em Análise' : 'Confirmado' }}
        </div>
      </div>
    </div>

    <div class="h-1 bg-gradient-to-r from-blue-900 to-blue-600 w-full mb-8 rounded"></div>

    <div class="grid grid-cols-2 gap-12 mb-12">
      
      <div>
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dados do Cliente</h3>
        <div class="text-sm space-y-1">
          <p class="text-lg font-bold text-slate-800">{{ pedido.cliente_nome }}</p>
          <p v-if="pedido.cliente_email" class="text-slate-600 flex items-center gap-2">
            ✉️ {{ pedido.cliente_email }}
          </p>
          <p v-if="pedido.cliente_telefone" class="text-slate-600 flex items-center gap-2">
            📞 {{ pedido.cliente_telefone }}
          </p>
          <p v-if="pedido.cliente_cidade" class="text-slate-600 flex items-center gap-2">
            📍 {{ pedido.cliente_cidade }}
          </p>
        </div>
      </div>

      <div class="bg-slate-50 p-6 rounded-lg border border-slate-100">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-400 text-xs uppercase font-semibold">Data de Emissão</p>
            <p class="font-medium text-slate-700">{{ new Date(pedido.data_criacao).toLocaleDateString('pt-BR') }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs uppercase font-semibold">Validade</p>
            <p class="font-medium text-slate-700">15 dias</p> </div>
          <div class="col-span-2 pt-2 border-t border-slate-200 mt-2">
            <p class="text-slate-400 text-xs uppercase font-semibold">Emitido por</p>
            <p class="font-medium text-slate-700">Sistema NetMark</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <table class="w-full text-sm text-left">
        <thead>
          <tr class="border-b-2 border-slate-800">
            <th class="py-3 font-bold text-slate-900 uppercase tracking-wider text-xs">Descrição</th>
            <th class="py-3 font-bold text-slate-900 uppercase tracking-wider text-xs text-center w-24">Qtd.</th>
            <th class="py-3 font-bold text-slate-900 uppercase tracking-wider text-xs text-right w-32">Preço Unit.</th>
            <th class="py-3 font-bold text-slate-900 uppercase tracking-wider text-xs text-right w-32">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="(item, index) in pedido.itens" :key="index" class="hover:bg-slate-50 transition-colors">
            <td class="py-4 pr-4">
              <p class="font-medium text-slate-800">{{ item.descricao || 'Produto sem nome' }}</p>
              <p class="text-xs text-slate-400 mt-0.5" v-if="item.detalhes">{{ item.detalhes }}</p>
            </td>
            <td class="py-4 text-center text-slate-600">{{ item.quantidade }}</td>
            <td class="py-4 text-right text-slate-600">{{ formatarMoeda(item.preco_unitario) }}</td>
            <td class="py-4 text-right font-bold text-slate-800">{{ formatarMoeda(item.quantidade * item.preco_unitario) }}</td>
          </tr>
          
          <tr v-if="!pedido.itens || pedido.itens.length === 0">
            <td colspan="4" class="py-8 text-center text-slate-400 italic bg-slate-50 rounded">
              Nenhum item detalhado. Valor lançado diretamente no total.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-end mb-16">
      <div class="w-72">
        <div class="space-y-3 pb-4 border-b border-slate-200 text-sm">
          <div class="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{{ formatarMoeda(pedido.total) }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Descontos</span>
            <span>-</span>
          </div>
        </div>
        <div class="flex justify-between items-center pt-4">
          <span class="text-xl font-bold text-slate-900">Total</span>
          <span class="text-2xl font-extrabold text-blue-800">{{ formatarMoeda(pedido.total) }}</span>
        </div>
      </div>
    </div>

    <div class="mt-auto">
      <div class="grid grid-cols-2 gap-12 items-end mb-8">
        <div>
          <h4 class="text-xs font-bold text-slate-900 uppercase mb-2">Observações</h4>
          <p class="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
            Pagamento via PIX ou Transferência Bancária.<br>
            Este orçamento é válido por 15 dias a partir da data de emissão.
            Em caso de dúvidas, entre em contato.
          </p>
        </div>
        <div class="text-center">
          <div class="border-b border-slate-400 w-full mb-2 h-8"></div>
          <p class="text-xs font-bold text-slate-700 uppercase">Assinatura do Responsável</p>
        </div>
      </div>

      <div class="border-t border-slate-200 pt-6 flex justify-between items-center text-xs text-slate-400">
        <p>Agência NetMark - Soluções Digitais</p>
        <p>Processado em {{ new Date().toLocaleString('pt-BR') }}</p>
      </div>
    </div>

  </div>
</template>

<script setup>
const route = useRoute();
const pedido = ref({
  // Dados iniciais para evitar piscar "undefined" antes do fetch
  itens: [],
  total: 0,
  data_criacao: new Date()
});

const formatarMoeda = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val || 0));

onMounted(async () => {
  try {
    const data = await $fetch(`/api/pedidos/${route.params.id}`);
    if (data) pedido.value = data;
    
    // Pequeno delay para garantir renderização de fontes/estilos
    setTimeout(() => {
        window.print();
    }, 800);
  } catch (e) {
    console.error(e);
    alert('Erro ao carregar dados para impressão.');
  }
});

definePageMeta({
  layout: false
});
</script>

<style scoped>
/* Estilos específicos para impressão */
@media print {
  @page { 
    margin: 0;
    size: A4; 
  }
  
  body { 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  }

  .print-container {
    padding: 2.5cm; /* Margem segura para impressoras */
    width: 100%;
    max-width: none;
    min-height: 100vh;
  }
}

/* Visualização na tela (Simula papel A4) */
@media screen {
  .print-container {
    max-width: 210mm; /* Largura A4 */
    margin: 40px auto;
    padding: 20px 40px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
  }
}
</style>