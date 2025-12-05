<template>
    <NuxtLayout name="dashboard-layout">
        <div class="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
            
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 mr-4">&larr; Voltar</NuxtLink>
                    <h1 class="text-3xl font-bold text-gray-900">🛠️ Orçamento Técnico (Engenharia)</h1>
                </div>
            </div>

            <form @submit.prevent="submitOrcamento" class="space-y-6">
                
                <div class="p-6 border rounded-lg shadow-sm bg-white">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Cliente</label>
                            <select v-model.number="form.cliente_id" required class="mt-1 block w-full rounded-md border-gray-300 p-2 border">
                                <option disabled value="0">Selecione um cliente...</option>
                                <option v-for="c in clientes" :key="c.id" :value="c.id">{{ c.nome }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Status</label>
                            <select v-model="form.status" class="mt-1 block w-full rounded-md border-gray-300 p-2 border bg-gray-50">
                                <option value="Orçamento">Em Análise (Orçamento)</option>
                                <option value="Aprovado">Validado p/ Proposta</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="p-6 border rounded-lg shadow-sm bg-white space-y-6">
                    <h2 class="text-xl font-bold text-gray-800 border-b pb-2">Detalhamento de Materiais</h2>
                    
                    <div v-for="(bloco, idxBloco) in form.blocos" :key="idxBloco" class="border p-4 rounded-lg bg-slate-50 relative">
                        <div class="flex justify-between items-center mb-4">
                            <input v-model="bloco.nome" placeholder="Nome do Bloco (Ex: Cozinha)" class="text-lg font-bold w-1/2 rounded-md border-gray-300 p-2" />
                            <button type="button" @click="removerBloco(idxBloco)" class="text-red-500 text-sm hover:underline">Remover Bloco</button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="min-w-full text-xs">
                                <thead class="bg-slate-200 text-slate-700 uppercase font-bold">
                                    <tr>
                                        <th class="p-2 text-left w-1/4">Material</th>
                                        <th class="p-2 text-left">Marca</th>
                                        <th class="p-2 text-left">Fornecedor</th>
                                        <th class="p-2 text-center w-16">Qtd</th>
                                        <th class="p-2 text-right">Preço Un.</th>
                                        <th class="p-2 text-right">Total</th>
                                        <th class="p-2 text-center">Data Ref.</th>
                                        <th class="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 bg-white">
                                    <tr v-for="(item, idxItem) in bloco.itens" :key="idxItem">
                                        <td class="p-1"><input v-model="item.material" placeholder="Ex: MDF Branco" class="w-full border-0 focus:ring-1 focus:ring-blue-500 text-xs" /></td>
                                        <td class="p-1"><input v-model="item.marca" placeholder="Ex: Arauco" class="w-full border-0 focus:ring-1 focus:ring-blue-500 text-xs" /></td>
                                        <td class="p-1"><input v-model="item.fornecedor" placeholder="Ex: Revest" class="w-full border-0 focus:ring-1 focus:ring-blue-500 text-xs" /></td>
                                        <td class="p-1"><input v-model.number="item.qtd" type="number" class="w-full text-center border-0 focus:ring-1 focus:ring-blue-500 text-xs" /></td>
                                        <td class="p-1"><input v-model.number="item.preco" type="number" step="0.01" class="w-full text-right border-0 focus:ring-1 focus:ring-blue-500 text-xs" /></td>
                                        <td class="p-1 text-right font-bold text-slate-700">{{ formatarMoeda(item.qtd * item.preco) }}</td>
                                        <td class="p-1"><input v-model="item.data_ref" type="date" class="w-full text-xs border-0 text-gray-400" /></td>
                                        <td class="p-1 text-center"><button type="button" @click="removerItem(idxBloco, idxItem)" class="text-red-400 font-bold">x</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <button type="button" @click="adicionarItem(idxBloco)" class="mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">+ Adicionar Material</button>
                        
                        <div class="text-right mt-2 font-bold text-slate-700">
                            Total Bloco: {{ formatarMoeda(calcularTotalBloco(bloco)) }}
                        </div>
                    </div>
                    
                    <button type="button" @click="adicionarBloco" class="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-gray-50 font-bold">
                        + Adicionar Novo Bloco (Cômodo)
                    </button>
                </div>

                <div class="sticky bottom-4 bg-slate-800 text-white p-4 rounded-lg shadow-xl flex justify-between items-center">
                    <div>
                        <p class="text-xs text-gray-400">Total Custo Materiais</p>
                        <p class="text-2xl font-bold">{{ formatarMoeda(totalGeral) }}</p>
                    </div>
                    <button type="submit" :disabled="submitting" class="bg-green-500 hover:bg-green-600 px-6 py-2 rounded font-bold transition">
                        {{ submitting ? 'Salvando...' : '💾 Salvar Orçamento' }}
                    </button>
                </div>

            </form>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
const submitting = ref(false);
const clientes = ref<any[]>([]);
const form = ref({
    cliente_id: 0,
    status: 'Orçamento',
    blocos: [
        {
            nome: 'Cozinha',
            itens: [
                { material: 'MDF Branco TX', marca: 'Arauco', fornecedor: 'Revest', qtd: 3, preco: 200, data_ref: new Date().toISOString().split('T')[0] },
                { material: 'Serviço de Corte', marca: '-', fornecedor: 'Platin', qtd: 25, preco: 20, data_ref: new Date().toISOString().split('T')[0] }
            ]
        }
    ]
});

// UseFetch Clientes... (igual ao anterior)
const { data: dadosClientes } = await useFetch('/api/clientes');
if (dadosClientes.value) clientes.value = dadosClientes.value as any[];

// Cálculos
const calcularTotalBloco = (bloco: any) => {
    return bloco.itens.reduce((acc: number, item: any) => acc + ((item.qtd || 0) * (item.preco || 0)), 0);
};
const totalGeral = computed(() => form.value.blocos.reduce((acc, b) => acc + calcularTotalBloco(b), 0));

const formatarMoeda = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Ações de Adicionar/Remover (Lógica padrão de array push/splice)
const adicionarItem = (idx: number) => form.value.blocos[idx].itens.push({ material: '', marca: '', fornecedor: '', qtd: 1, preco: 0, data_ref: new Date().toISOString().split('T')[0] });
const removerItem = (idxB: number, idxI: number) => form.value.blocos[idxB].itens.splice(idxI, 1);
const adicionarBloco = () => form.value.blocos.push({ nome: '', itens: [] });
const removerBloco = (idx: number) => form.value.blocos.splice(idx, 1);

const submitOrcamento = async () => {
    if(!form.value.cliente_id) return alert('Selecione o cliente');
    submitting.value = true;
    
    // Transforma para o formato do banco
    const itensFlat = form.value.blocos.flatMap(bloco => 
        bloco.itens.map(item => ({
            comodo: bloco.nome || 'Geral',
            descricao: item.material,
            marca: item.marca,             // Novo Campo
            fornecedor: item.fornecedor,   // Novo Campo
            quantidade: item.qtd,
            preco_unitario: item.preco,
            data_atualizacao_preco: item.data_ref, // Novo Campo
            // Preço venda inicial igual custo (markup será aplicado depois)
            preco_venda: item.qtd * item.preco 
        }))
    );

    try {
        await $fetch('/api/pedidos', {
            method: 'POST',
            body: {
                cliente_id: form.value.cliente_id,
                status: form.value.status,
                valor_total: totalGeral.value,
                itens: itensFlat
            }
        });
        navigateTo('/pedidos');
    } catch (e) {
        alert('Erro ao salvar');
    } finally {
        submitting.value = false;
    }
}
</script>