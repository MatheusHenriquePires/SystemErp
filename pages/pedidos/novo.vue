<template>
  <DashboardLayout>
    <div class="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
      
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
          <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 mr-4">&larr; Voltar</NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900">🛠️ Orçamento Técnico</h1>
        </div>

        <div>
          <input 
            type="file" 
            ref="fileInput" 
            class="hidden" 
            accept="image/*" 
            @change="uploadPrint"
          />
          <button 
            type="button"
            @click="$refs.fileInput.click()" 
            :disabled="lendoImagem"
            class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <span v-if="lendoImagem" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Lendo Imagem...
            </span>
            <span v-else>📸 Importar Print (IA)</span>
          </button>
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
                        <option value="PROPOSTA">Proposta Enviada</option>
                        <option value="VENDA">Venda Fechada</option>
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
                    <td class="p-1"><input v-model="item.material" class="w-full border-0 focus:ring-1 focus:ring-blue-500 text-xs" /></td>
                    <td class="p-1"><input v-model="item.marca" class="w-full border-0 focus:ring-1 focus:ring-blue-500 text-xs" /></td>
                    <td class="p-1"><input v-model="item.fornecedor" class="w-full border-0 focus:ring-1 focus:ring-blue-500 text-xs" /></td>
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
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';
const router = useRouter();

const submitting = ref(false);
const lendoImagem = ref(false); 
const fileInput = ref<HTMLInputElement | null>(null);

const clientes = ref<any[]>([]);
const form = ref({
    cliente_id: 0,
    status: 'Orçamento',
    blocos: [
        {
            nome: 'Geral',
            itens: [
                { material: 'Material Exemplo', marca: '', fornecedor: '', qtd: 1, preco: 0, data_ref: new Date().toISOString().split('T')[0] },
            ]
        }
    ]
});

// Carrega clientes
onMounted(async () => {
    const dados: any = await $fetch('/api/clientes');
    clientes.value = dados || [];
});

const uploadPrint = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    lendoImagem.value = true;
    const arquivo = target.files[0];
    const formData = new FormData();
    formData.append('file', arquivo);

    try {
        const itensImportados = await $fetch<any[]>('/api/ler-orcamento', {
            method: 'POST',
            body: formData
        });

        if (itensImportados && itensImportados.length > 0) {
            form.value.blocos.push({
                nome: 'Importado da Imagem',
                itens: itensImportados.map(item => ({
                    material: item.material || 'Item importado',
                    marca: item.marca || '',
                    fornecedor: item.fornecedor || '',
                    qtd: Number(item.qtd) || 1,
                    preco: Number(item.preco) || 0,
                    data_ref: new Date().toISOString().split('T')[0]
                }))
            });
            alert('Itens lidos com sucesso!');
        } else {
            alert('A IA não conseguiu identificar itens.');
        }

    } catch (error) {
        alert('Erro ao ler imagem.');
    } finally {
        lendoImagem.value = false;
        if (fileInput.value) fileInput.value.value = '';
    }
};

const calcularTotalBloco = (bloco: any) => {
    return bloco.itens.reduce((acc: number, item: any) => acc + ((item.qtd || 0) * (item.preco || 0)), 0);
};
const totalGeral = computed(() => form.value.blocos.reduce((acc, b) => acc + calcularTotalBloco(b), 0));

const formatarMoeda = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const adicionarItem = (idx: number) => form.value.blocos[idx].itens.push({ material: '', marca: '', fornecedor: '', qtd: 1, preco: 0, data_ref: new Date().toISOString().split('T')[0] });
const removerItem = (idxB: number, idxI: number) => form.value.blocos[idxB].itens.splice(idxI, 1);
const adicionarBloco = () => form.value.blocos.push({ nome: '', itens: [] });
const removerBloco = (idx: number) => form.value.blocos.splice(idx, 1);

const submitOrcamento = async () => {
    if(!form.value.cliente_id) return alert('Selecione o cliente');
    submitting.value = true;
    
    // Prepara os dados (achata os blocos para enviar ao banco)
    const itensParaSalvar = form.value.blocos.flatMap(bloco => 
        bloco.itens.map(item => ({
            comodo: bloco.nome || 'Geral',
            descricao: item.material, // Importante: aqui mandamos a descrição em texto
            marca: item.marca,
            fornecedor: item.fornecedor,
            quantidade: item.qtd,
            preco_unitario: item.preco,
            subtotal: item.qtd * item.preco 
        }))
    );

    try {
        await $fetch('/api/pedidos', {
            method: 'POST',
            body: {
                cliente_id: form.value.cliente_id,
                status: form.value.status,
                valor_total: totalGeral.value,
                itens: itensParaSalvar
            }
        });
        router.push('/pedidos');
    } catch (e) {
        alert('Erro ao salvar');
    } finally {
        submitting.value = false;
    }
}
useHead({ title: 'Novo Orçamento Técnico' });
</script>