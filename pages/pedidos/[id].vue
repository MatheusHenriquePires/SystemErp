<template>
  <NuxtLayout name="dashboard-layout">
    <div class="max-w-5xl mx-auto my-8 p-8 bg-white shadow-xl print:shadow-none print:m-0 print:p-0 print:w-full">
      
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="flex items-center gap-3">
            <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 font-medium">
                &larr; Voltar
            </NuxtLink>
            <div class="h-6 w-px bg-gray-300"></div>
            <button 
                @click="modoCliente = !modoCliente"
                :class="modoCliente ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'"
                class="px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2"
            >
                {{ modoCliente ? '👀 Visão do Cliente' : '🛠️ Visão Técnica' }}
            </button>
        </div>

        <div class="flex items-center gap-3">
             <div class="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded border border-yellow-200">
                <span class="text-xs font-bold text-yellow-800 uppercase">Markup:</span>
                <input 
                    type="number" 
                    v-model.number="fatorMultiplicador" 
                    step="0.1" 
                    min="1.0"
                    class="w-16 text-center font-bold text-blue-900 bg-white border border-yellow-300 rounded focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <button @click="imprimir" class="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2">
                🖨️ Imprimir
            </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-500">Carregando proposta...</div>
      <div v-else-if="!data" class="text-center text-red-500 py-10">Pedido não encontrado.</div>
      
      <div v-else class="space-y-6 text-slate-800 font-sans">

        <header class="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div class="flex items-center gap-4">
                <img src="/logo.png" alt="Logo" class="h-24 w-auto object-contain" onerror="this.style.display='none'"/>
                <div>
                    <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tighter">NOME DA EMPRESA</h1>
                    <p class="text-sm text-gray-500">Soluções em Ambientes Planejados</p>
                </div>
            </div>
            <div class="text-right">
                <div class="bg-slate-100 p-3 rounded-lg print:bg-transparent print:p-0">
                    <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Orçamento Nº</p>
                    <p class="text-3xl font-bold text-slate-800 mb-2">#{{ data.id }}</p>
                    <p class="text-sm font-medium text-slate-600">{{ data.nome_cliente || 'Cliente' }}</p>
                    <p class="text-xs text-gray-400">{{ formatarData(new Date().toISOString()) }}</p>
                </div>
            </div>
        </header>

        <div v-if="modoCliente">
            <div v-for="(grupo, nomeComodo) in itensAgrupados" :key="nomeComodo" class="mb-10 break-inside-avoid">
                
                <div class="flex justify-between items-end border-b-2 border-slate-200 pb-2 mb-4">
                    <h2 class="text-xl font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <span class="w-2 h-6 bg-slate-800 block"></span>
                        {{ nomeComodo === 'PADRAO' ? 'Ambientes Gerais' : nomeComodo }}
                    </h2>
                    <div class="text-right">
                        <span class="text-xl font-bold text-slate-900">
                            {{ formatarMoeda(grupo.subtotal * fatorMultiplicador) }}
                        </span>
                    </div>
                </div>

                <div class="pl-4 pr-4">
                    <p class="text-xs text-gray-400 font-bold mb-1 print:hidden uppercase">Descrição Técnica (Editável):</p>
                    <textarea 
                        v-model="descricoesBlocos[nomeComodo]" 
                        rows="4"
                        class="w-full text-sm text-gray-600 leading-relaxed border-none bg-transparent resize-none focus:ring-0 p-0 text-justify"
                    ></textarea>
                </div>

            </div>
        </div>

        <div v-else>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p class="text-sm text-blue-800 font-bold">🛠️ Modo Técnico Ativado</p>
                <p class="text-xs text-blue-600">Esta visão mostra fornecedores, marcas e custos detalhados. Não imprima isso para o cliente.</p>
            </div>

            <div v-for="(grupo, nomeComodo) in itensAgrupados" :key="nomeComodo" class="mb-8 border rounded-lg overflow-hidden bg-white shadow-sm">
                <h3 class="bg-gray-100 p-3 font-bold text-gray-700 border-b flex justify-between">
                    <span>{{ nomeComodo }}</span>
                    <span class="text-sm bg-white px-2 py-0.5 rounded border">Total Custo: {{ formatarMoeda(grupo.subtotal) }}</span>
                </h3>
                
                <table class="w-full text-xs text-left">
                    <thead class="bg-gray-50 text-gray-500 uppercase font-semibold">
                        <tr>
                            <th class="p-3">Material</th>
                            <th class="p-3">Marca</th>
                            <th class="p-3">Fornecedor</th>
                            <th class="p-3 text-center">Qtd</th>
                            <th class="p-3 text-right">Custo Un.</th>
                            <th class="p-3 text-right">Total Custo</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="(item, idx) in grupo.itens" :key="idx" class="hover:bg-gray-50">
                            <td class="p-3 font-medium text-gray-900">{{ item.descricao }}</td>
                            <td class="p-3 text-gray-500">{{ item.marca || '-' }}</td>
                            <td class="p-3 text-gray-500">{{ item.fornecedor || '-' }}</td>
                            <td class="p-3 text-center">{{ item.quantidade }}</td>
                            <td class="p-3 text-right text-gray-600">{{ formatarMoeda(item.preco_unitario) }}</td>
                            <td class="p-3 text-right font-bold text-gray-800">{{ formatarMoeda(item.quantidade * item.preco_unitario) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <footer class="mt-12 pt-6 border-t-2 border-slate-800 break-inside-avoid">
          <div class="flex flex-col md:flex-row justify-end items-center gap-6">
            
            <div v-if="!modoCliente" class="text-right text-sm text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
                <p>Custo Total: {{ formatarMoeda(totalBase) }}</p>
                <p class="text-green-600">Lucro Estimado: {{ formatarMoeda(totalFinal - totalBase) }}</p>
            </div>

            <div class="text-right">
                <p class="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Valor Total do Investimento</p>
                <p class="text-4xl font-black text-green-700">{{ formatarMoeda(totalFinal) }}</p>
            </div>
          </div>
          
          <div v-if="modoCliente" class="mt-16 text-center">
            <p class="text-sm font-bold text-slate-800 mb-2">Condições Gerais</p>
            <p class="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Este orçamento tem validade de 10 dias. O pagamento pode ser realizado conforme combinado. 
                A entrega e montagem estão inclusas para a cidade de origem. Alterações no projeto podem implicar em reajuste de valores.
            </p>
          </div>
        </footer>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.id;

const data = ref<any>(null);
const loading = ref(true);
const modoCliente = ref(true); // Começa no modo cliente (bonito)
const fatorMultiplicador = ref(1.0);
const descricoesBlocos = ref<Record<string, string>>({});

// Texto Padrão (P3)
const TEXTO_PADRAO = `Móveis planejados produzidos com materiais de alta qualidade (100% MDF), com ferragens de primeira linha e acabamento impecável. Inclui transporte, entrega e instalação especializada. Garantia total contra defeitos de fabricação. Projeto desenvolvido para aliar funcionalidade, durabilidade e estética.`;

// --- CÁLCULOS E AGRUPAMENTO ---

const itensAgrupados = computed(() => {
    if (!data.value || !data.value.itens) return {};

    return data.value.itens.reduce((acc: any, item: any) => {
        let comodoKey = item.comodo;
        if (!comodoKey || comodoKey.trim() === '') comodoKey = 'PADRAO';

        if (!acc[comodoKey]) {
            acc[comodoKey] = { itens: [], subtotal: 0 };
            
            // Se ainda não tem texto para esse bloco, define o padrão
            if (!descricoesBlocos.value[comodoKey]) {
                descricoesBlocos.value[comodoKey] = `Ambiente ${comodoKey === 'PADRAO' ? 'Geral' : comodoKey}: ${TEXTO_PADRAO}`;
            }
        }

        const totalItemBase = (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0);
        acc[comodoKey].itens.push(item);
        acc[comodoKey].subtotal += totalItemBase;

        return acc;
    }, {});
});

const totalBase = computed(() => {
    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((acc: number, item: any) => acc + ((Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0)), 0);
});

const totalFinal = computed(() => totalBase.value * fatorMultiplicador.value);

// --- FUNÇÕES ---

const imprimir = () => {
    // Garante que está no modo cliente ao imprimir
    modoCliente.value = true;
    setTimeout(() => window.print(), 100);
}

const formatarMoeda = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const formatarData = (dataIso: string) => {
    if (!dataIso) return '';
    try { return new Date(dataIso).toLocaleDateString('pt-BR'); } catch { return dataIso; }
};

const fetchData = async () => {
    try {
        const response: any = await $fetch(`/api/pedidos/${id}`);
        data.value = response;
        
        // Tenta recuperar Markup anterior
        if (data.value && data.value.valor_total) {
            const custo = data.value.itens.reduce((sum:number, i:any) => sum + (Number(i.quantidade)*Number(i.preco_unitario)), 0);
            const venda = Number(data.value.valor_total);
            if (custo > 0 && venda > custo) {
                fatorMultiplicador.value = Number((venda / custo).toFixed(2));
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<style scoped>
@media print {
  .print\:hidden { display: none !important; }
  .break-inside-avoid { break-inside: avoid; }
  body { background: white; -webkit-print-color-adjust: exact; }
  .shadow-xl { box-shadow: none !important; }
  
  /* Esconde scrollbar da textarea na impressão */
  textarea { overflow: hidden; resize: none; }
}
</style>