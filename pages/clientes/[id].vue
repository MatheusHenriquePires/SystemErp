<template>
  <DashboardLayout>
    <div class="max-w-5xl mx-auto px-4 py-8">
      
      <!-- Cabeçalho -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
            <NuxtLink to="/clientes" class="text-gray-500 hover:text-blue-600 transition">← Voltar</NuxtLink>
            <h1 class="text-2xl font-bold text-gray-800">👤 Ficha do Cliente</h1>
        </div>
        <button @click="excluirCliente" class="text-red-500 hover:text-red-700 text-sm font-bold border border-red-200 px-3 py-2 rounded hover:bg-red-50 transition">
            Excluir Cliente
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- COLUNA 1: FORMULÁRIO DE EDIÇÃO -->
        <div class="lg:col-span-1">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Dados Cadastrais</h2>
                
                <form @submit.prevent="salvarAlteracoes" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                        <input v-model="form.nome" type="text" required class="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input v-model="form.email" type="email" class="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone / WhatsApp</label>
                        <input v-model="form.telefone" type="text" class="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cidade</label>
                            <input v-model="form.cidade" type="text" class="w-full border rounded p-2 text-sm" />
                        </div>
                        <!-- Adicione mais campos se tiver no banco, ex: UF -->
                    </div>

                    <!-- <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço</label>
                        <textarea v-model="form.endereco" rows="2" class="w-full border rounded p-2 text-sm resize-none"></textarea>
                    </div> -->

                    <button type="submit" :disabled="salvando" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition shadow-sm disabled:opacity-50">
                        {{ salvando ? 'Salvando...' : '💾 Atualizar Dados' }}
                    </button>
                </form>
            </div>
        </div>

        <!-- COLUNA 2: HISTÓRICO DE PEDIDOS -->
        <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 class="font-bold text-slate-800">Histórico de Movimentações</h2>
                    <span class="text-xs font-medium bg-white px-2 py-1 rounded border text-gray-500">
                        {{ historico.length }} registros
                    </span>
                </div>

                <table class="w-full text-sm text-left">
                    <thead class="bg-gray-100 text-gray-500 uppercase text-xs font-semibold">
                        <tr>
                            <th class="px-6 py-3">Pedido</th>
                            <th class="px-6 py-3">Data</th>
                            <th class="px-6 py-3 text-center">Status</th>
                            <th class="px-6 py-3 text-right">Valor</th>
                            <th class="px-6 py-3 text-center">Ver</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="ped in historico" :key="ped.id" class="hover:bg-blue-50 transition group">
                            <td class="px-6 py-4 font-mono font-bold text-blue-600">#{{ ped.id }}</td>
                            <td class="px-6 py-4 text-gray-600">{{ formatarData(ped.data_criacao) }}</td>
                            
                            <td class="px-6 py-4 text-center">
                                <span :class="`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getCorStatus(ped.status)}`">
                                    {{ ped.status }}
                                </span>
                            </td>

                            <td class="px-6 py-4 text-right font-bold text-gray-800">
                                {{ formatarMoeda(ped.valor_total) }}
                            </td>

                            <td class="px-6 py-4 text-center">
                                <NuxtLink :to="`/pedidos/${ped.id}`" class="text-gray-400 hover:text-blue-600 font-bold px-2 py-1 rounded hover:bg-white transition" title="Abrir Orçamento">
                                    👁️
                                </NuxtLink>
                            </td>
                        </tr>
                        <tr v-if="historico.length === 0">
                            <td colspan="5" class="px-6 py-10 text-center text-gray-400">
                                Este cliente ainda não possui orçamentos ou vendas.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const salvando = ref(false);
const historico = ref<any[]>([]);
const form = ref({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    endereco: '' // Opcional se não tiver no banco
});

// Carrega dados iniciais
const carregarCliente = async () => {
    try {
        const data: any = await $fetch(`/api/clientes/${id}`);
        // Preenche o formulário
        form.value = { ...data.cliente };
        // Preenche o histórico
        historico.value = data.historico || [];
    } catch (e) {
        alert('Erro ao carregar cliente.');
        router.push('/clientes');
    }
};

const salvarAlteracoes = async () => {
    salvando.value = true;
    try {
        await $fetch(`/api/clientes/${id}`, {
            method: 'PUT',
            body: form.value
        });
        alert('Dados atualizados com sucesso!');
    } catch (e) {
        alert('Erro ao atualizar.');
    } finally {
        salvando.value = false;
    }
};

const excluirCliente = async () => {
    if(!confirm('Tem certeza? Isso apagará o cadastro do cliente.')) return;
    try {
        await $fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        router.push('/clientes');
    } catch (e: any) {
        alert(e.data?.message || 'Erro ao excluir');
    }
};

// Helpers Visuais
const formatarMoeda = (val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
const formatarData = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

const getCorStatus = (status: string) => {
    if (['VENDA', 'PAGO', 'Aprovado', 'Finalizado'].includes(status)) return 'bg-green-100 text-green-700 border-green-200';
    if (['PROPOSTA', 'Proposta'].includes(status)) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
};

onMounted(carregarCliente);
useHead({ title: 'Detalhes do Cliente' });
</script>