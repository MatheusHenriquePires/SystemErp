<template>
  <NuxtLayout name="dashboard-layout">
    <div class="p-8">
      
      <div class="flex justify-between items-center mb-8">
        <div>
            <h1 class="text-2xl font-bold text-slate-800">Financeiro</h1>
            <p class="text-gray-500">Controle de Contas a Receber (Entradas e Parcelas)</p>
        </div>
        
        <div class="flex gap-4">
            <div class="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-bold border border-green-200">
                Recebido Mês: {{ formatarMoeda(totalRecebido) }}
            </div>
            <div class="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold border border-yellow-200">
                A Receber: {{ formatarMoeda(totalPendente) }}
            </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-500 uppercase font-semibold border-b">
                <tr>
                    <th class="p-4">Vencimento</th>
                    <th class="p-4">Descrição / Parcela</th>
                    <th class="p-4">Cliente</th>
                    <th class="p-4">Valor</th>
                    <th class="p-4">Status</th>
                    <th class="p-4 text-center">Ação</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                <tr v-for="item in lista" :key="item.id" class="hover:bg-gray-50 group transition">
                    
                    <td class="p-4 font-medium" :class="verificarAtraso(item) ? 'text-red-600' : 'text-slate-600'">
                        {{ formatarData(item.data_vencimento) }}
                        <span v-if="verificarAtraso(item)" class="text-[10px] bg-red-100 px-1 rounded ml-1">Venceu</span>
                    </td>

                    <td class="p-4">
                        <p class="font-bold text-slate-700">{{ item.descricao }}</p>
                        <p class="text-xs text-gray-400 uppercase">{{ item.forma_pagamento }}</p>
                    </td>

                    <td class="p-4">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                {{ item.cliente_nome?.charAt(0) || '?' }}
                            </div>
                            <div>
                                <p class="text-slate-700 font-medium">{{ item.cliente_nome || 'Cliente não ident.' }}</p>
                                <NuxtLink :to="`/pedidos/${item.pedido_id}`" class="text-xs text-blue-500 hover:underline">
                                    Ver Pedido #{{ item.pedido_id }}
                                </NuxtLink>
                            </div>
                        </div>
                    </td>

                    <td class="p-4 font-bold text-slate-700">
                        {{ formatarMoeda(item.valor) }}
                    </td>

                    <td class="p-4">
                        <span v-if="item.status === 'PAGO'" class="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                            ✅ Pago {{ item.data_pagamento ? em(item.data_pagamento) : '' }}
                        </span>
                        <span v-else class="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
                            ⏳ Pendente
                        </span>
                    </td>

                    <td class="p-4 text-center">
                        <button 
                            v-if="item.status === 'PENDENTE'"
                            @click="darBaixa(item)"
                            class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow transition transform active:scale-95"
                        >
                            Confirmar Pagamento
                        </button>
                        <span v-else class="text-gray-400 text-xs">Concluído</span>
                    </td>

                </tr>
                
                <tr v-if="lista.length === 0">
                    <td colspan="6" class="p-8 text-center text-gray-500">Nenhum lançamento financeiro encontrado.</td>
                </tr>
            </tbody>
        </table>
      </div>

    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const lista = ref<any[]>([]);
const carregando = ref(true);

// Carrega a lista
const carregarDados = async () => {
    carregando.value = true;
    try {
        const dados = await $fetch<any[]>('/api/financeiro');
        lista.value = dados || [];
    } catch (e) {
        alert('Erro ao carregar financeiro');
    } finally {
        carregando.value = false;
    }
};

// Ação de Dar Baixa
const darBaixa = async (item: any) => {
    if(!confirm(`Confirmar recebimento de ${formatarMoeda(item.valor)}?`)) return;

    try {
        await $fetch('/api/financeiro/baixar', {
            method: 'POST',
            body: { id: item.id }
        });
        // Atualiza localmente para não precisar recarregar tudo
        item.status = 'PAGO';
        item.data_pagamento = new Date().toISOString();
    } catch (e) {
        alert('Erro ao processar');
    }
};

// Utilitários de Data e Moeda
const formatarMoeda = (val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
const formatarData = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
const em = (d: string) => `em ${new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;

// Verifica se está atrasado (Pendente e data < hoje)
const verificarAtraso = (item: any) => {
    if (item.status === 'PAGO') return false;
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const venc = new Date(item.data_vencimento); venc.setHours(0,0,0,0);
    return venc < hoje;
};

// Totais Computados
const totalRecebido = computed(() => lista.value.filter(i => i.status === 'PAGO').reduce((acc, i) => acc + Number(i.valor), 0));
const totalPendente = computed(() => lista.value.filter(i => i.status === 'PENDENTE').reduce((acc, i) => acc + Number(i.valor), 0));

onMounted(carregarDados);
</script>