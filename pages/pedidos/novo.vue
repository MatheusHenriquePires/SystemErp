<template>
    <!-- ✅ BUILD CORRIGIDO: Removemos <NuxtLayout> daqui -->
    <ClientOnly>
        <div class="px-4 py-6 md:px-6 md:py-8 lg:px-8 max-w-4xl mx-auto">
            
            <div class="flex items-center mb-6">
                <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 mr-4">
                    &larr; Voltar
                </NuxtLink>
                <h1 class="text-3xl font-bold text-gray-900">✨ Novo Orçamento (por Cômodo)</h1>
            </div>

            <form @submit.prevent="submitOrcamento" class="space-y-6">
                
                <div class="p-6 border rounded-lg shadow-sm bg-white">
                    <h2 class="text-xl font-semibold mb-4 text-gray-700">Dados Principais</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Cliente</label>
                            <select v-model.number="form.cliente_id" required 
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                                
                                <option disabled value="0">
                                    {{ loadingClientes ? 'Carregando clientes...' : 'Selecione um cliente...' }}
                                </option>
                                
                                <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                                    {{ cliente.nome }}
                                </option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Status Inicial</label>
                            <select v-model="form.status"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-gray-50">
                                <option value="Orçamento">ORÇAMENTO</option>
                                <option value="PENDENTE">PENDENTE</option>
                                <option value="Produção">PRODUÇÃO</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="p-6 border rounded-lg shadow-sm bg-white space-y-6">
                    <h2 class="text-xl font-semibold text-gray-700">Agrupamento por Cômodo</h2>
                    
                    <div v-for="(comodo, indexComodo) in form.comodos" :key="indexComodo" class="border p-4 rounded-lg bg-gray-50">
                        <div class="flex justify-between items-center mb-3">
                            <input v-model="comodo.comodo" placeholder="Nome do Cômodo (Ex: Cozinha Planejada)" required
                                class="text-lg font-bold w-full rounded-md border-gray-300 focus:ring-blue-500 p-2" />
                            <button type="button" @click="removerComodo(indexComodo)" class="text-red-500 hover:text-red-700 ml-4 font-bold">
                                Remover
                            </button>
                        </div>

                        <table class="min-w-full divide-y divide-gray-200 mt-3">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="p-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                    <th class="p-2 w-20 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                                    <th class="p-2 w-28 text-right text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                                    <th class="p-2 w-28 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                    <th class="p-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(produto, indexProduto) in comodo.produtos" :key="indexProduto">
                                    <td class="p-2">
                                        <input v-model="produto.descricao" placeholder="MDF Branco TX, Parafuso..." required class="w-full text-sm border-b border-gray-300 bg-transparent focus:border-blue-500 outline-none" />
                                    </td>
                                    <td class="p-2">
                                        <input v-model.number="produto.quantidade" type="number" step="1" min="1" required class="w-full text-sm text-center border-b border-gray-300 bg-transparent focus:border-blue-500 outline-none" />
                                    </td>
                                    <td class="p-2">
                                        <input v-model.number="produto.preco_unitario" type="number" step="0.01" required class="w-full text-sm text-right border-b border-gray-300 bg-transparent focus:border-blue-500 outline-none" />
                                    </td>
                                    <td class="p-2 text-right font-medium text-gray-700">
                                        {{ formatarMoeda(produto.quantidade * produto.preco_unitario) }}
                                    </td>
                                    <td class="p-2">
                                        <button type="button" @click="removerProduto(indexComodo, indexProduto)" class="text-red-400 hover:text-red-600 font-bold">X</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <button type="button" @click="adicionarProduto(indexComodo)" class="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                            + Adicionar Produto
                        </button>
                        
                        <div class="text-right mt-3 pt-3 border-t">
                            <span class="font-bold text-lg text-slate-700">Total do Cômodo: {{ formatarMoeda(calcularTotalComodo(comodo)) }}</span>
                        </div>
                    </div>
                    
                    <button type="button" @click="adicionarComodo" class="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition">
                        + Adicionar Novo Cômodo
                    </button>
                </div>

                <div class="text-right p-6 border rounded-lg shadow-sm bg-green-50 sticky bottom-4 z-10 shadow-lg">
                    <h2 class="text-2xl font-extrabold text-green-700">Total Geral: {{ formatarMoeda(calcularTotalGeral) }}</h2>
                    <button type="submit" :disabled="submitting" 
                        class="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 transition transform hover:scale-105">
                        {{ submitting ? 'Salvando...' : '💾 Salvar Orçamento' }}
                    </button>
                </div>
            </form>
        </div>
        
        <template #fallback>
            <div class="text-center py-10 text-gray-600">Carregando formulário...</div>
        </template>
    </ClientOnly>
</template>

<script setup lang="ts">
// ✅ BUILD CORRIGIDO: Define o layout aqui
definePageMeta({
    layout: 'dashboard-layout'
});

const router = useRouter();
const submitting = ref(false);
const clientes = ref<any[]>([]);
const loadingClientes = ref(true);

const form = ref({
    cliente_id: 0,
    status: 'Orçamento',
    total: 0,
    comodos: [
        {
            comodo: 'Cozinha Planejada',
            produtos: [
                { descricao: 'MDF Branco TX (15mm)', quantidade: 1, preco_unitario: 0 },
            ]
        }
    ]
});

const fetchClientes = async () => {
    loadingClientes.value = true;
    try {
        const data: any = await $fetch('/api/clientes');
        clientes.value = data || [];
        if (clientes.value.length > 0) {
            form.value.cliente_id = clientes.value[0].id;
        }
    } catch (e) {
        console.error("Erro ao carregar clientes:", e);
    } finally {
        loadingClientes.value = false;
    }
};

const formatarMoeda = (valor: number) => {
    const numero = Number(valor);
    if (isNaN(numero)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
};

const calcularTotalComodo = (comodo: any) => {
    return comodo.produtos.reduce((sum: number, item: any) => {
        return sum + ((Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0));
    }, 0);
};

const calcularTotalGeral = computed(() => {
    return form.value.comodos.reduce((sumGeral: number, comodo: any) => {
        return sumGeral + calcularTotalComodo(comodo);
    }, 0);
});

// Ações do Formulário
const adicionarComodo = () => {
    form.value.comodos.push({ comodo: '', produtos: [{ descricao: '', quantidade: 1, preco_unitario: 0 }] });
};
const removerComodo = (index: number) => {
    if (form.value.comodos.length > 1 && confirm('Remover este cômodo e todos os itens?')) {
        form.value.comodos.splice(index, 1);
    }
};
const adicionarProduto = (indexComodo: number) => {
    form.value.comodos[indexComodo].produtos.push({ descricao: '', quantidade: 1, preco_unitario: 0 });
};
const removerProduto = (indexComodo: number, indexProduto: number) => {
    if (form.value.comodos[indexComodo].produtos.length > 1) {
        form.value.comodos[indexComodo].produtos.splice(indexProduto, 1);
    }
};

// Envio Corrigido
const submitOrcamento = async () => {
    const total = calcularTotalGeral.value;

    if (!form.value.cliente_id || total <= 0) {
        alert('Selecione um cliente e adicione itens ao orçamento.');
        return;
    }

    submitting.value = true;

    // ✅ CORREÇÃO LÓGICA: Transforma [Cômodos] em [Itens] para o Banco de Dados
    const itensParaSalvar = form.value.comodos.flatMap(grupo => {
        return grupo.produtos.map(produto => ({
            comodo: grupo.comodo || 'Geral', // Salva o nome do cômodo
            descricao: produto.descricao,
            quantidade: produto.quantidade,
            preco_unitario: produto.preco_unitario, // Preço de custo/base
            // Calcula o preço total do item para referência
            preco_venda: Number(produto.preco_unitario) * Number(produto.quantidade),
            multiplicador: 1.0 
        }))
    });

    try {
        const response: any = await $fetch('/api/pedidos', {
            method: 'POST',
            body: {
                cliente_id: form.value.cliente_id,
                status: form.value.status,
                valor_total: total,
                itens: itensParaSalvar // ✅ Envia o formato correto
            }
        });

        alert(`Orçamento #${response.id} criado com sucesso!`);
        router.push('/pedidos');
    } catch (e: any) {
        console.error(e);
        alert(`Erro: ${e.response?._data?.message || e.message}`);
    } finally {
        submitting.value = false;
    }
};

onMounted(fetchClientes);
</script>