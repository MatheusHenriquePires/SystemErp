<template>
  <NuxtLayout name="dashboard-layout">
    <div class="max-w-5xl mx-auto my-8 p-8 bg-white shadow-xl print:shadow-none print:m-0 print:p-0 print:w-full">
      
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="flex items-center gap-3">
            <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 font-medium transition">
                &larr; Voltar
            </NuxtLink>
            <div class="h-6 w-px bg-gray-300"></div>
            
            <button 
                @click="modoCliente = !modoCliente"
                :class="modoCliente ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'"
                class="px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2"
            >
                {{ modoCliente ? '👀 Visão do Cliente' : '🛠️ Visão Técnica (Editável)' }}
            </button>
        </div>

        <div class="flex items-center gap-3">
             <button 
                v-if="!modoCliente"
                @click="salvarTudo"
                :disabled="salvando"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
                {{ salvando ? 'Salvando...' : '💾 Salvar Alterações' }}
            </button>

             <div class="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded border border-yellow-200" title="Multiplicador sobre o custo">
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
                <img src="/logo1.jpeg" alt="Logo" class="h-24 w-auto object-contain" onerror="this.style.display='none'"/>
                <div>
                    <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tighter">Arbóreo</h1>
                    <p class="text-sm text-gray-500">Soluções em Ambientes Planejados</p>
                </div>
            </div>
            <div class="text-right">
                <div class="bg-slate-100 p-3 rounded-lg print:bg-transparent print:p-0">
                    <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Orçamento Nº</p>
                    <p class="text-3xl font-bold text-slate-800 mb-2">#{{ data.id }}</p>
                    <p class="text-sm font-medium text-slate-600">{{ data.cliente_nome || 'Cliente' }}</p>
                    <p class="text-xs text-gray-400">{{ formatarData(data.data_criacao || new Date().toISOString()) }}</p>
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
                    <p class="text-xs text-gray-400 font-bold mb-1 print:hidden uppercase">Descrição do Ambiente:</p>
                    <textarea 
                        v-model="descricoesBlocos[nomeComodo]" 
                        rows="4"
                        class="w-full text-sm text-gray-600 leading-relaxed border-none bg-transparent resize-none focus:ring-0 p-0 text-justify"
                    ></textarea>
                </div>
            </div>
        </div>

        <div v-else>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex justify-between items-center">
                <div>
                    <p class="text-sm text-blue-800 font-bold">🛠️ Modo Técnico / Edição</p>
                    <p class="text-xs text-blue-600">Altere itens, adicione materiais e crie novos ambientes aqui.</p>
                </div>
            </div>

            <div v-for="(grupo, nomeComodo) in itensAgrupados" :key="nomeComodo" class="mb-8 border rounded-lg overflow-hidden bg-white shadow-sm">
                <h3 class="bg-gray-100 p-3 font-bold text-gray-700 border-b flex justify-between items-center">
                    <span>{{ nomeComodo }}</span>
                    <span class="text-xs bg-white px-2 py-1 rounded border text-gray-500">
                        Custo do Ambiente: {{ formatarMoeda(grupo.subtotal) }}
                    </span>
                </h3>
                
                <table class="w-full text-xs text-left">
                    <thead class="bg-gray-50 text-gray-500 uppercase font-semibold">
                        <tr>
                            <th class="p-3 w-1/3">Material</th>
                            <th class="p-3">Marca</th>
                            <th class="p-3">Fornecedor</th>
                            <th class="p-3 text-center w-16">Qtd</th>
                            <th class="p-3 text-right w-24">Custo Un.</th>
                            <th class="p-3 text-right w-24">Total</th>
                            <th class="p-3 text-center w-8"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="(item, idx) in grupo.itens" :key="idx" class="hover:bg-gray-50 group">
                            <td class="p-1">
                                <input v-model="item.descricao" class="w-full border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-gray-900 font-medium placeholder-gray-300" placeholder="Nome do item" />
                            </td>
                            <td class="p-1">
                                <input v-model="item.marca" class="w-full border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-gray-500" placeholder="-" />
                            </td>
                            <td class="p-1">
                                <input v-model="item.fornecedor" class="w-full border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-gray-500" placeholder="-" />
                            </td>
                            <td class="p-1">
                                <input type="number" v-model.number="item.quantidade" class="w-full text-center border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 font-bold text-blue-600" />
                            </td>
                            <td class="p-1">
                                <input type="number" step="0.01" v-model.number="item.preco_unitario" class="w-full text-right border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 font-bold text-gray-700" />
                            </td>
                            <td class="p-3 text-right font-bold text-gray-800">
                                {{ formatarMoeda((item.quantidade || 0) * (item.preco_unitario || 0)) }}
                            </td>
                            <td class="p-1 text-center">
                                <button @click="removerItem(item)" class="text-red-300 hover:text-red-600 font-bold text-lg transition" title="Remover item">×</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="bg-gray-50 p-2 border-t flex justify-start">
                    <button 
                        @click="adicionarItem(nomeComodo)" 
                        class="text-xs flex items-center gap-1 text-blue-600 font-bold hover:bg-blue-100 px-3 py-1 rounded transition"
                    >
                        <span class="text-lg">+</span> Adicionar Material em {{ nomeComodo }}
                    </button>
                </div>
            </div>

            <button 
                @click="adicionarNovoAmbiente"
                class="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 hover:text-blue-600 transition mb-8"
            >
                + Criar Novo Ambiente / Cômodo
            </button>
        </div>

        <footer class="mt-12 pt-6 border-t-2 border-slate-800 break-inside-avoid">
          <div class="flex flex-col md:flex-row justify-end items-center gap-6">
            
            <div v-if="!modoCliente" class="text-right text-sm text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
                <p>Custo Total (Base): {{ formatarMoeda(totalBase) }}</p>
                <p class="text-green-600">Lucro Estimado: {{ formatarMoeda(totalFinal - totalBase) }}</p>
            </div>

            <div class="text-right">
                <p class="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Valor Total</p>
                <p class="text-4xl font-black text-green-700">{{ formatarMoeda(totalFinal) }}</p>
            </div>
          </div>
          
          <div v-if="modoCliente" class="mt-16 text-center">
            <p class="text-sm font-bold text-slate-800 mb-2">Condições Gerais</p>
            <p class="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Este orçamento tem validade de 10 dias. Pagamento em até 12x (consulte condições).
                Entrega e montagem inclusas.
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

// Estados Reativos
const data = ref<any>(null);
const loading = ref(true);
const salvando = ref(false);
const modoCliente = ref(true); // Controla qual tela exibe
const fatorMultiplicador = ref(1.0); // Markup padrão
const descricoesBlocos = ref<Record<string, string>>({}); // Descrições comerciais por ambiente

// Texto padrão para novos ambientes
const TEXTO_PADRAO = `Móveis planejados de alto padrão, produzidos em 100% MDF. Inclui ferragens com amortecimento, puxadores definidos em projeto e instalação especializada.`;

// --- Computed Properties (Cálculos Automáticos) ---

// Agrupa os itens por "comodo" para exibir separado
const itensAgrupados = computed(() => {
    if (!data.value || !data.value.itens) return {};

    return data.value.itens.reduce((acc: any, item: any) => {
        let comodoKey = item.comodo;
        if (!comodoKey || comodoKey.trim() === '') comodoKey = 'PADRAO';

        if (!acc[comodoKey]) {
            acc[comodoKey] = { itens: [], subtotal: 0 };
            // Inicia descrição se não existir
            if (!descricoesBlocos.value[comodoKey]) {
                descricoesBlocos.value[comodoKey] = `${TEXTO_PADRAO}`;
            }
        }

        // Soma custo
        const custoItem = (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0);
        acc[comodoKey].itens.push(item);
        acc[comodoKey].subtotal += custoItem;

        return acc;
    }, {});
});

// Total de Custo (Soma de tudo)
const totalBase = computed(() => {
    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((acc: number, item: any) => acc + ((Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0)), 0);
});

// Valor Final de Venda (Custo * Markup)
const totalFinal = computed(() => totalBase.value * fatorMultiplicador.value);


// --- AÇÕES DO SISTEMA ---

// Adiciona linha em branco na tabela
const adicionarItem = (comodo: string) => {
    // ID null indica para o backend que deve fazer INSERT
    data.value.itens.push({
        id: null, 
        pedido_id: id,
        comodo: comodo, // Importante passar o cômodo
        descricao: '',
        marca: '',
        fornecedor: '',
        quantidade: 1,
        preco_unitario: 0
    });
};

const adicionarNovoAmbiente = () => {
    const nome = prompt("Nome do novo ambiente (Ex: Lavanderia):");
    if (nome && nome.trim() !== '') {
        adicionarItem(nome.toUpperCase()); // Já cria adicionando o 1º item
    }
};

const removerItem = (itemParaRemover: any) => {
    if(!confirm("Tem certeza que deseja remover este item da lista?")) return;
    // Remove visualmente da lista
    data.value.itens = data.value.itens.filter((i: any) => i !== itemParaRemover);
};

const salvarTudo = async () => {
    salvando.value = true;
    try {
        await $fetch('/api/pedidos', {
            method: 'PUT',
            body: { 
                id: id,
                valor_total: totalFinal.value,
                // Envia a lista completa (itens existentes + novos)
                itens: data.value.itens 
            }
        });
        alert('Orçamento salvo com sucesso!');
        fetchData(); // Recarrega para pegar os IDs novos gerados
    } catch (e: any) {
        alert('Erro ao salvar: ' + e.message);
    } finally {
        salvando.value = false;
    }
};

const imprimir = () => {
    modoCliente.value = true; // Força visão limpa
    setTimeout(() => window.print(), 200);
};

// --- INICIALIZAÇÃO ---
const fetchData = async () => {
    try {
        loading.value = true;
        const response: any = await $fetch(`/api/pedidos/${id}`);
        data.value = response;
        
        // Tenta calcular o Markup atual se já existir valor salvo
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

const formatarMoeda = (val: any) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);
};

const formatarData = (dataIso: string) => {
    try { return new Date(dataIso).toLocaleDateString('pt-BR'); } catch { return ''; }
};

onMounted(fetchData);
</script>

<style scoped>
@media print {
  .print\:hidden { display: none !important; }
  .break-inside-avoid { break-inside: avoid; }
  body { background: white; -webkit-print-color-adjust: exact; }
  .shadow-xl { box-shadow: none !important; }
  textarea { overflow: hidden; resize: none; border: none; }
}
</style>