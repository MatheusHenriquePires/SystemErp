<template>
    <NuxtLayout name="dashboard-layout">
        
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
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                    
                                    <option disabled value="">
                                      {{ loadingClientes ? 'Carregando clientes...' : 'Selecione um cliente...' }}
                                    </option>
                                    
                                    <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                                        {{ cliente.nome }} (ID: {{ cliente.id }})
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Status Inicial</label>
                                <select v-model="form.status"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                    <option value="ORCAMENTO">ORÇAMENTO</option>
                                    <option value="PENDENTE">PENDENTE</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 border rounded-lg shadow-sm bg-white space-y-6">
                        <h2 class="text-xl font-semibold text-gray-700">Agrupamento por Cômodo</h2>
                        
                        <div v-for="(comodo, indexComodo) in form.comodos" :key="indexComodo" class="border p-4 rounded-lg bg-gray-50">
                            <div class="flex justify-between items-center mb-3">
                                <input v-model="comodo.comodo" placeholder="Nome do Cômodo (Ex: Cozinha Planejada)" required
                                    class="text-lg font-bold w-full rounded-md border-gray-300 focus:ring-blue-500" />
                                <button type="button" @click="removerComodo(indexComodo)" class="text-red-500 hover:text-red-700 ml-4">
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
                                        <td class="p-2"><input v-model="produto.descricao" placeholder="MDF Branco TX, Parafuso..." required class="w-full text-sm border-none bg-transparent" /></td>
                                        <td class="p-2"><input v-model.number="produto.quantidade" type="number" step="1" min="1" required class="w-full text-sm text-center border-none bg-transparent" /></td>
                                        <td class="p-2"><input v-model.number="produto.preco_unitario" type="number" step="0.01" required class="w-full text-sm text-right border-none bg-transparent" /></td>
                                        <td class="p-2 text-right font-medium">{{ formatarMoeda(produto.quantidade * produto.preco_unitario) }}</td>
                                        <td class="p-2"><button type="button" @click="removerProduto(indexComodo, indexProduto)" class="text-red-400 hover:text-red-600">X</button></td>
                                    </tr>
                                </tbody>
                            </table>

                            <button type="button" @click="adicionarProduto(indexComodo)" class="mt-3 text-sm text-blue-500 hover:text-blue-700 font-medium">
                                + Adicionar Produto
                            </button>
                            
                            <div class="text-right mt-3 pt-3 border-t">
                                <span class="font-bold text-lg">Total do Cômodo: {{ formatarMoeda(calcularTotalComodo(comodo)) }}</span>
                            </div>
                        </div>
                        
                        <button type="button" @click="adicionarComodo" class="bg-indigo-500 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-600 transition">
                            + Adicionar Novo Cômodo
                        </button>
                    </div>

                    <div class="text-right p-6 border rounded-lg shadow-sm bg-green-50">
                        <h2 class="text-2xl font-extrabold text-green-700">Total Geral: {{ formatarMoeda(calcularTotalGeral) }}</h2>
                        <button type="submit" :disabled="submitting" 
                            class="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50">
                            {{ submitting ? 'Enviando...' : 'Salvar Orçamento' }}
                        </button>
                    </div>
                </form>
            </div>
            
            <template #fallback>
                <div class="text-center py-10 text-gray-600"> Preparando o formulário... </div>
            </template>
        </ClientOnly>
    </NuxtLayout>
</template>

<script setup lang="ts">
const router = useRouter();
const submitting = ref(false);
// [NOVO ESTADO]
const clientes = ref<any[]>([]);
const loadingClientes = ref(true);

const form = ref({
    cliente_id: 0, // ID inicial 0 até ser populado
    status: 'ORCAMENTO',
    total: 0,
    comodos: [
        {
            comodo: 'Cozinha Planejada',
            produtos: [
                { descricao: 'MDF Branco TX (15mm)', quantidade: 1, preco_unitario: 380.00 },
            ]
        }
    ]
});

// [NOVA FUNÇÃO]: Busca clientes
const fetchClientes = async () => {
    loadingClientes.value = true;
    try {
        // Usa a API que você confirmou que já existe
        const data = await $fetch('/api/clientes');
        clientes.value = data || [];
        // Define o ID inicial com o primeiro cliente, se existir
        if (clientes.value.length > 0) {
            form.value.cliente_id = clientes.value[0].id;
        } else {
             // Se não tiver clientes, garante que o campo não envie um valor inválido
             form.value.cliente_id = 0; 
        }
    } catch (e) {
        console.error("Erro ao carregar clientes:", e);
    } finally {
        loadingClientes.value = false;
    }
};

// ... Funções de cálculo e formatação (mantidas)
const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
};

const calcularTotalComodo = (comodo: any) => {
    return comodo.produtos.reduce((sum: number, item: any) => {
        const quantidade = Number(item.quantidade) || 0;
        const preco = Number(item.preco_unitario) || 0;
        return sum + (quantidade * preco);
    }, 0);
};

const calcularTotalGeral = computed(() => {
    return form.value.comodos.reduce((sumGeral: number, comodo: any) => {
        const totalComodo = comodo.produtos.reduce((sum: number, item: any) => {
            const quantidade = Number(item.quantidade) || 0;
            const preco = Number(item.preco_unitario) || 0;
            return sum + (quantidade * preco);
        }, 0);

        return sumGeral + totalComodo;
    }, 0);
});

// ... Funções de manipulação do formulário (mantidas)
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

// Envio do Formulário (mantida)
const submitOrcamento = async () => {
    form.value.total = calcularTotalGeral.value;

    if (!form.value.cliente_id || form.value.total <= 0) {
        alert('Obrigatório selecionar um cliente e o orçamento deve ser maior que zero.');
        return;
    }

    submitting.value = true;

    try {
        const response = await $fetch('/api/pedidos', {
            method: 'POST',
            body: form.value
        });

        alert(`Orçamento #${response.id} criado com sucesso!`);
        router.push('/pedidos');
    } catch (e: any) {
        console.error(e);
        alert(`Falha ao criar orçamento: ${e.message}`);
    } finally {
        submitting.value = false;
    }
};

// [CHAMADA NOVA]: Buscar clientes ao montar
onMounted(fetchClientes);
</script>