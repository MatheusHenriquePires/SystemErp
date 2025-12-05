<template>
  <NuxtLayout name="dashboard-layout">
    <div class="max-w-5xl mx-auto my-8 p-8 bg-white shadow-xl print:shadow-none print:m-0 print:p-0 print:w-full" id="area-impressao">
      
      <div data-html2canvas-ignore="true" class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="flex items-center gap-3">
            <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 font-medium transition">
                &larr; Voltar
            </NuxtLink>
            <div class="h-6 w-px bg-gray-300"></div>
            
            <button 
                @click="alternarModoCliente"
                :class="modoCliente ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'"
                class="px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2"
            >
                {{ modoCliente ? '👀 Visão do Cliente' : '🛠️ Visão Técnica' }}
            </button>
        </div>

        <div class="flex items-center gap-3">
             
             <div v-if="!modoCliente" class="flex bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                <button 
                    @click="modoCorteUnico = false"
                    class="px-3 py-2 text-xs font-bold uppercase transition flex items-center gap-2"
                    :class="!modoCorteUnico ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'"
                >
                    🏠 Por Ambiente
                </button>
                <div class="w-px bg-gray-300"></div>
                <button 
                    @click="modoCorteUnico = true"
                    class="px-3 py-2 text-xs font-bold uppercase transition flex items-center gap-2"
                    :class="modoCorteUnico ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-50'"
                >
                    🪚 Corte Único
                </button>
             </div>

             <button 
                v-if="!modoCliente && !modoCorteUnico"
                @click="salvarTudo"
                :disabled="salvando"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
                {{ salvando ? 'Salvando...' : '💾 Salvar' }}
            </button>

            <div v-if="!modoCliente" class="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded border border-yellow-200" title="Multiplicador sobre o custo">
                <span class="text-xs font-bold text-yellow-800 uppercase">Markup:</span>
                <input 
                    type="number" 
                    v-model.number="fatorMultiplicador" 
                    step="0.1" 
                    min="1.0"
                    class="w-14 text-center font-bold text-blue-900 bg-white border border-yellow-300 rounded focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <button 
                @click="gerarPDF" 
                :disabled="gerandoPDF"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
                <span v-if="gerandoPDF" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span v-else>📄 PDF</span>
            </button>

            <button @click="imprimir" class="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2">
                🖨️
            </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-500">Carregando proposta...</div>
      <div v-else-if="!data" class="text-center text-red-500 py-10">Pedido não encontrado.</div>
      
      <div v-else class="space-y-6 text-slate-800 font-sans" id="conteudo-orcamento">

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
            <div v-for="(grupo, nomeComodo) in itensAgrupados" :key="nomeComodo" class="mb-10 break-inside-avoid page-break">
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
                    <p class="text-xs text-gray-400 font-bold mb-1 print:hidden uppercase" data-html2canvas-ignore="true">Descrição Comercial:</p>
                    <textarea 
                        v-model="descricoesBlocos[nomeComodo]" 
                        rows="4"
                        class="w-full text-sm text-gray-600 leading-relaxed border-none bg-transparent resize-none focus:ring-0 p-0 text-justify"
                    ></textarea>
                </div>
            </div>
        </div>

        <div v-else-if="!modoCorteUnico">
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p class="text-sm text-blue-800 font-bold">🛠️ Modo Edição por Ambiente</p>
                <p class="text-xs text-blue-600">Ideal para organizar a montagem e instalação cômodo a cômodo.</p>
            </div>

            <div v-for="(grupo, nomeComodo) in itensAgrupados" :key="nomeComodo" class="mb-8 border rounded-lg overflow-hidden bg-white shadow-sm">
                <h3 class="bg-gray-100 p-3 font-bold text-gray-700 border-b flex justify-between items-center">
                    <span>{{ nomeComodo }}</span>
                    <span class="text-xs bg-white px-2 py-1 rounded border text-gray-500">
                        Custo: {{ formatarMoeda(grupo.subtotal) }}
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
                            <td class="p-1"><input v-model="item.descricao" class="w-full border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 font-medium" /></td>
                            <td class="p-1"><input v-model="item.marca" class="w-full border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-gray-500" placeholder="-" /></td>
                            <td class="p-1"><input v-model="item.fornecedor" class="w-full border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-gray-500" placeholder="-" /></td>
                            <td class="p-1"><input type="number" v-model.number="item.quantidade" class="w-full text-center border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 font-bold text-blue-600" /></td>
                            <td class="p-1"><input type="number" step="0.01" v-model.number="item.preco_unitario" class="w-full text-right border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 font-bold text-gray-700" /></td>
                            <td class="p-3 text-right font-bold text-gray-800">{{ formatarMoeda((item.quantidade || 0) * (item.preco_unitario || 0)) }}</td>
                            <td class="p-1 text-center"><button @click="removerItem(item)" class="text-red-300 hover:text-red-600 font-bold text-lg" title="Remover item">×</button></td>
                        </tr>
                    </tbody>
                </table>
                <div class="bg-gray-50 p-2 border-t flex justify-start">
                    <button @click="adicionarItem(nomeComodo)" class="text-xs flex items-center gap-1 text-blue-600 font-bold hover:bg-blue-100 px-3 py-1 rounded transition">
                        <span class="text-lg">+</span> Adicionar Material
                    </button>
                </div>
            </div>

            <button @click="adicionarNovoAmbiente" class="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 hover:text-blue-600 transition mb-8">
                + Criar Novo Ambiente
            </button>
        </div>

        <div v-else>
            <div class="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-orange-800 font-bold">🪚 Plano de Corte Único (Produção)</p>
                        <p class="text-xs text-orange-700">Materiais agrupados para otimização de chapa e compra.</p>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-bold text-gray-500 uppercase">Custo Total Matéria-Prima</span>
                        <p class="text-2xl font-black text-gray-800">{{ formatarMoeda(totalBase) }}</p>
                    </div>
                </div>
            </div>

            <div class="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-800 text-white uppercase font-semibold">
                        <tr>
                            <th class="p-3 w-1/3">Material / Descrição</th>
                            <th class="p-3">Marca/Ref</th>
                            <th class="p-3 text-center">Onde é usado?</th>
                            <th class="p-3 text-center w-24">Qtd Total</th>
                            <th class="p-3 text-right w-32">Total Custo</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="(material, idx) in itensCorteUnico" :key="idx" class="hover:bg-orange-50">
                            <td class="p-3 font-bold text-gray-800">{{ material.descricao || 'Sem nome' }}</td>
                            <td class="p-3 text-gray-500">{{ material.marca || '-' }}</td>
                            <td class="p-3 text-center text-xs text-gray-500">
                                <span v-for="loc in material.locais" :key="loc" class="inline-block bg-gray-100 px-2 py-0.5 rounded mr-1 mb-1 border">
                                    {{ loc }}
                                </span>
                            </td>
                            <td class="p-3 text-center font-black text-lg text-blue-600 bg-blue-50">
                                {{ material.qtdTotal }}
                            </td>
                            <td class="p-3 text-right font-bold text-gray-700">
                                {{ formatarMoeda(material.custoTotal) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="p-4 bg-gray-50 text-center text-xs text-gray-500 border-t">
                    * Esta lista agrupa itens idênticos de todos os ambientes para facilitar o corte e compra.
                </div>
            </div>
        </div>

        <footer class="mt-12 pt-6 border-t-2 border-slate-800 break-inside-avoid">
          <div class="flex flex-col md:flex-row justify-end items-center gap-6">
            <div v-if="!modoCliente" class="text-right text-sm text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
                <p>Custo Matéria-Prima: {{ formatarMoeda(totalBase) }}</p>
                <p class="text-green-600">Margem Bruta: {{ formatarMoeda(totalFinal - totalBase) }}</p>
            </div>
            <div class="text-right">
                <p class="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Valor Final</p>
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

// Estados
const data = ref<any>(null);
const loading = ref(true);
const salvando = ref(false);
const gerandoPDF = ref(false); // NOVO
const modoCliente = ref(true); 
const modoCorteUnico = ref(false); 
const fatorMultiplicador = ref(1.0);
const descricoesBlocos = ref<Record<string, string>>({});

const TEXTO_PADRAO = `Móveis planejados 100% MDF. Ferragens com amortecimento e instalação inclusa.`;

// --- FUNÇÃO DE PDF (NOVO) ---
const gerarPDF = async () => {
    // 1. Força o modo cliente para o PDF sair limpo
    modoCliente.value = true;
    modoCorteUnico.value = false;
    gerandoPDF.value = true;

    // 2. Importa a biblioteca dinamicamente (para não dar erro no Nuxt)
    // @ts-ignore
    const html2pdf = (await import('html2pdf.js')).default;

    // 3. Configurações do PDF
    const element = document.getElementById('area-impressao');
    const opt = {
        margin:       [10, 10, 10, 10], // Margens (top, left, bottom, right)
        filename:     `Orcamento_Arboreo_${id}_${data.value.cliente_nome}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, // Scale 2 melhora a qualidade
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 4. Gera e Salva
    await html2pdf().set(opt).from(element).save();
    
    gerandoPDF.value = false;
};

// --- CÁLCULOS ---

const itensAgrupados = computed(() => {
    if (!data.value || !data.value.itens) return {};
    return data.value.itens.reduce((acc: any, item: any) => {
        let comodo = item.comodo || 'PADRAO';
        if (!acc[comodo]) {
            acc[comodo] = { itens: [], subtotal: 0 };
            if (!descricoesBlocos.value[comodo]) descricoesBlocos.value[comodo] = TEXTO_PADRAO;
        }
        acc[comodo].itens.push(item);
        acc[comodo].subtotal += (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0);
        return acc;
    }, {});
});

const itensCorteUnico = computed(() => {
    if (!data.value || !data.value.itens) return [];
    
    const mapa = new Map();
    data.value.itens.forEach((item: any) => {
        const chave = (item.descricao + item.marca).trim().toLowerCase();
        if (!mapa.has(chave)) {
            mapa.set(chave, {
                descricao: item.descricao,
                marca: item.marca,
                qtdTotal: 0,
                custoTotal: 0,
                locais: new Set()
            });
        }
        const entry = mapa.get(chave);
        entry.qtdTotal += Number(item.quantidade) || 0;
        entry.custoTotal += (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0);
        entry.locais.add(item.comodo || 'Geral');
    });

    return Array.from(mapa.values()).map((i: any) => ({
        ...i,
        locais: Array.from(i.locais)
    }));
});

const totalBase = computed(() => {
    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((acc: number, i: any) => acc + ((Number(i.quantidade) || 0) * (Number(i.preco_unitario) || 0)), 0);
});

const totalFinal = computed(() => totalBase.value * fatorMultiplicador.value);

// --- AÇÕES ---

const alternarModoCliente = () => {
    modoCliente.value = !modoCliente.value;
    if (modoCliente.value) modoCorteUnico.value = false;
};

const adicionarItem = (comodo: string) => {
    data.value.itens.push({ id: null, pedido_id: id, comodo: comodo, descricao: '', quantidade: 1, preco_unitario: 0 });
};

const adicionarNovoAmbiente = () => {
    const nome = prompt("Nome do novo ambiente:");
    if (nome) adicionarItem(nome.toUpperCase());
};

const removerItem = (item: any) => {
    if(confirm("Remover item?")) data.value.itens = data.value.itens.filter((i: any) => i !== item);
};

const salvarTudo = async () => {
    salvando.value = true;
    try {
        await $fetch('/api/pedidos', {
            method: 'PUT',
            body: { id: id, valor_total: totalFinal.value, itens: data.value.itens }
        });
        alert('Salvo com sucesso!');
        fetchData();
    } catch (e: any) { alert('Erro: ' + e.message); } 
    finally { salvando.value = false; }
};

const imprimir = () => {
    if (!modoCorteUnico.value) modoCliente.value = true;
    setTimeout(() => window.print(), 200);
};

const fetchData = async () => {
    try {
        const res: any = await $fetch(`/api/pedidos/${id}`);
        data.value = res;
        if (data.value?.valor_total) {
            const custo = data.value.itens.reduce((s:number, i:any) => s + (Number(i.quantidade)*Number(i.preco_unitario)), 0);
            if (custo > 0) fatorMultiplicador.value = Number((Number(data.value.valor_total) / custo).toFixed(2));
        }
    } catch (e) { console.error(e); } 
    finally { loading.value = false; }
};

const formatarMoeda = (val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);
const formatarData = (d: string) => { try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return ''; } };

onMounted(fetchData);
</script>

<style scoped>
@media print {
  .print\:hidden { display: none !important; }
  .break-inside-avoid { break-inside: avoid; }
  body { background: white; -webkit-print-color-adjust: exact; }
  .shadow-xl { box-shadow: none !important; }
  textarea { border: none; resize: none; overflow: hidden; }
}

/* Quebra de página automática no PDF se ficar muito grande */
.page-break {
    page-break-inside: avoid;
}
</style>