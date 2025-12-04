<template>
  <NuxtLayout name="dashboard-layout">
    <div class="max-w-4xl mx-auto my-8 p-8 bg-white shadow-xl print:shadow-none print:m-0 print:p-0">
      
      <!-- Cabeçalho de Navegação (Escondido na Impressão) -->
      <div class="mb-6 flex justify-between items-center print:hidden">
        <NuxtLink to="/pedidos" class="text-gray-600 hover:text-blue-600 flex items-center gap-1">
          &larr; Voltar para Pedidos
        </NuxtLink>
        <div class="flex space-x-2">
            <button 
                @click="applyMarkup" 
                :disabled="savingMarkup"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition disabled:opacity-50"
            >
                {{ savingMarkup ? 'Salvando...' : '💾 Salvar Margem' }}
            </button>
            <button @click="printProposal" class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2">
                🖨️ Imprimir / PDF
            </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-500">
        Carregando dados do pedido...
      </div>
      <div v-else-if="error || !data" class="text-red-600 border border-red-200 p-4 rounded bg-red-50 text-center">
        Pedido não encontrado ou erro ao carregar.
      </div>
      
      <div v-else class="space-y-6 print:space-y-4">
        
        <!-- Cabeçalho da Proposta -->
        <header class="border-b pb-4 mb-4 flex justify-between items-end">
          <div>
            <h1 class="text-3xl font-extrabold text-slate-800 uppercase tracking-wide">Orçamento #{{ id }}</h1>
            <p class="mt-1 text-sm text-gray-500">Emissão: {{ formatarData(data.data_criacao) }}</p>
          </div>
          <div class="text-right">
             <p class="font-bold text-xl text-slate-900">{{ data.cliente_nome || data.nome_cliente || 'Cliente' }}</p>
             <p class="text-sm text-gray-500">{{ data.cliente_cidade || '' }}</p>
          </div>
        </header>

        <!-- Controle de Markup (Apenas na Tela) -->
        <section class="p-4 border border-yellow-200 rounded-lg bg-yellow-50 mb-6 flex justify-between items-center print:hidden">
            <div>
                <h2 class="text-sm font-bold text-yellow-800 uppercase">Margem de Lucro / Markup</h2>
                <p class="text-xs text-yellow-700">Multiplica o custo base para gerar o valor final.</p>
            </div>
            <div class="flex items-center space-x-2 bg-white p-2 rounded border border-yellow-200 shadow-sm">
                <span class="text-gray-500 font-bold text-sm">Fator:</span>
                <input 
                    type="number" 
                    v-model.number="fatorMultiplicador" 
                    step="0.1"
                    min="1.0" 
                    class="w-20 text-center font-bold text-lg text-blue-900 border-none focus:ring-0 bg-transparent outline-none"
                />
                <span class="text-gray-400 font-bold">x</span>
            </div>
        </section>

        <!-- Lista de Itens (Agrupada por Cômodo) -->
        <section class="mb-8">
            <h2 class="text-lg font-bold mb-4 uppercase text-gray-400 tracking-wider border-b pb-1">Detalhamento</h2>

            <div v-for="(grupo, comodoNome) in itensAgrupados" :key="comodoNome" class="mb-6 break-inside-avoid">
                <!-- Título do Cômodo -->
                <h3 class="font-bold text-lg mb-2 text-slate-800 bg-gray-100 p-2 rounded-t border-l-4 border-slate-800">
                    {{ comodoNome }}
                </h3>

                <!-- Tabela de Itens -->
                <table class="w-full text-sm">
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="(item, index) in grupo.itens" :key="index">
                            <td class="py-2 pl-2 text-gray-700 w-full">{{ item.descricao }}</td>
                            <td class="py-2 px-4 text-gray-500 text-center whitespace-nowrap">{{ item.quantidade }} un.</td>
                            
                            <!-- Valor Unitário (Com Markup aplicado visualmente) -->
                            <td class="py-2 pr-2 text-right font-medium text-slate-900 whitespace-nowrap">
                                {{ formatarMoeda(Number(item.preco_unitario) * Number(item.quantidade) * fatorMultiplicador) }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Subtotal do Cômodo -->
                <div class="text-right mt-2 pt-2 border-t border-gray-300 font-bold text-slate-600">
                    Subtotal: {{ formatarMoeda(grupo.total * fatorMultiplicador) }}
                </div>
            </div>
        </section>

        <!-- Totais Finais -->
        <footer class="pt-6 border-t-2 border-slate-800 mt-6 break-inside-avoid">
          <div class="flex justify-end">
            <div class="w-full md:w-1/2 space-y-3">

              <!-- Detalhes do cálculo (Visível apenas na tela para conferência) -->
              <div class="print:hidden space-y-1 text-sm text-gray-500 border-b pb-2 mb-2">
                  <div class="flex justify-between">
                    <span>Custo Base (Sem Lucro):</span>
                    <span>{{ formatarMoeda(totalBase) }}</span>
                  </div>
                  <div class="flex justify-between text-yellow-700">
                    <span>Lucro Estimado ({{ ((fatorMultiplicador - 1) * 100).toFixed(0) }}%):</span>
                    <span>+ {{ formatarMoeda(totalBase * (fatorMultiplicador - 1)) }}</span>
                  </div>
              </div>
              
              <!-- Total Final para o Cliente -->
              <div class="flex justify-between text-2xl font-extrabold text-slate-900 items-end">
                <span class="uppercase tracking-widest text-sm text-gray-500 mb-1">Total Final</span>
                <span>{{ formatarMoeda(totalFinal) }}</span>
              </div>
              
              <div class="text-xs text-gray-400 text-right mt-4 print:mt-10">
                Orçamento válido por 10 dias. Sujeito a alteração sem aviso prévio.
              </div>

            </div>
          </div>
        </footer>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const id = useRoute().params.id;
const data = ref<any>(null);
const loading = ref(true);
const error = ref<any>(null);
const savingMarkup = ref(false);

const fatorMultiplicador = ref(1.0); 

// --- FUNÇÕES UTILITÁRIAS ---

function formatarMoeda(valor: number): string {
    const numero = Number(valor);
    if (isNaN(numero)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
}

function formatarData(dataStr: string): string {
    if (!dataStr) return '';
    try {
        return new Date(dataStr).toLocaleDateString('pt-BR');
    } catch {
        return dataStr;
    }
}

function printProposal(): void {
  window.print();
}

// --- LÓGICA DE AGRUPAMENTO (CORRIGIDA) ---

const itensAgrupados = computed(() => {
    if (!data.value || !data.value.itens) return {};

    // Usa reduce para agrupar pelo campo 'comodo' vindo do banco
    return data.value.itens.reduce((groups: any, item: any) => {
        // Se não tiver comodo definido, joga para "Outros"
        const comodoName = item.comodo || 'Outros'; 
        
        if (!groups[comodoName]) {
            groups[comodoName] = { total: 0, itens: [] };
        }
        
        // Calcula o custo base (Quantidade * Preço Unitário Original)
        const subtotalBase = (Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0);
        
        groups[comodoName].total += subtotalBase;
        groups[comodoName].itens.push(item);
        
        return groups;
    }, {});
});

const totalBase = computed(() => {
    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((sum: number, item: any) => {
        return sum + ((Number(item.quantidade) || 0) * (Number(item.preco_unitario) || 0));
    }, 0);
});

const totalFinal = computed(() => {
    // Aplica o fator multiplicador sobre o total base
    return totalBase.value * fatorMultiplicador.value;
});

// --- AÇÕES ---

const applyMarkup = async () => {
    if (!confirm(`Atualizar o valor final do pedido multiplicando o custo por ${fatorMultiplicador.value}?`)) return;
    
    savingMarkup.value = true;
    try {
        // Envia para o backend salvar o novo total e o markup usado
        await $fetch(`/api/pedidos`, {
            method: 'PUT',
            body: { 
                id: id,
                valor_total: totalFinal.value,
                // Se quiser salvar o fator para usar depois, adicione uma coluna 'markup' no banco
                // e envie aqui: markup: fatorMultiplicador.value 
            }
        });
        
        alert('Valor atualizado com sucesso!');

    } catch (e: any) {
        alert(`Erro ao salvar: ${e.message || 'Erro de servidor'}`);
    } finally {
        savingMarkup.value = false;
    }
}

const fetchData = async () => {
    try {
        const response: any = await $fetch(`/api/pedidos/${id}`); 
        data.value = response;

        // Tenta calcular qual foi o fator usado anteriormente
        // Se o valor total salvo for maior que o custo, deduzimos o markup
        if (data.value && data.value.itens) {
            const custoTotal = data.value.itens.reduce((acc: number, item: any) => acc + (Number(item.quantidade) * Number(item.preco_unitario)), 0);
            const valorVenda = Number(data.value.valor_total || data.value.total || 0);
            
            if (custoTotal > 0 && valorVenda > custoTotal) {
                // Recupera o fator com 2 casas decimais
                fatorMultiplicador.value = Number((valorVenda / custoTotal).toFixed(2));
            } else {
                fatorMultiplicador.value = 1.0; 
            }
        }
    } catch (e: any) {
        error.value = e; 
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<style scoped>
@media print {
  /* Esconde elementos de navegação na impressão */
  .print\:hidden {
    display: none !important;
  }
  
  /* Evita que um cômodo seja cortado no meio da página */
  .break-inside-avoid {
    break-inside: avoid;
  }

  /* Garante fundo branco e remove sombras */
  body {
    background: white;
  }
  .shadow-xl {
    box-shadow: none !important;
  }
}
</style>