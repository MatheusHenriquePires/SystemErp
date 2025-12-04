<template>
</template>

<script setup lang="ts">
const id = useRoute().params.id;
const data = ref<any>(null);
const loading = ref(true);
const error = ref<any>(null);
const savingMarkup = ref(false);

const markupPercent = ref(0); 

// Funções utilitárias (mantidas)
function formatarMoeda(valor: number): string { /* ... */ }
function formatarData(data: string): string { /* ... */ }
function printProposal(): void { /* ... */ }


// [CORREÇÃO FINAL]: Propriedades Computadas (Logic)
const itensAgrupados = computed(() => {
    if (!data.value || !data.value.itens) return {};

    return data.value.itens.reduce((groups, item) => {
        // SOLUÇÃO FINAL: Lendo o novo alias 'room_name'
        const comodoName = String(item.room_name || '').trim() || 'Geral'; 
        
        if (!groups[comodoName]) {
            groups[comodoName] = { total: 0, itens: [] };
        }
        
        const quantidade = Number(item.quantidade);
        const preco = Number(item.preco_unitario);
        const subtotal = quantidade * preco;
        
        groups[comodoName].total += subtotal;
        groups[comodoName].itens.push(item);
        
        return groups;
    }, {});
});


// ... (resto das funções mantidas) ...

const totalBase = computed(() => {
    const baseFromData = parseFloat(data.value?.valor_total || data.value?.total || 0);
    if (baseFromData > 0) return baseFromData;

    if (!data.value || !data.value.itens) return 0;
    return data.value.itens.reduce((sum: number, item: any) => {
        const quantidade = Number(item.quantidade || item.quantidade);
        const preco = Number(item.preco_unitario || item.preco_unitario);
        return sum + (quantidade * preco);
    }, 0);
});

const totalMarkupAcrescido = computed(() => {
    return totalBase.value * (markupPercent.value / 100);
});
const totalFinal = computed(() => {
    const finalFromData = parseFloat(data.value?.final_total || 0);
    if (finalFromData > 0) return finalFromData;

    return totalBase.value + totalMarkupAcrescido.value;
});


const applyMarkup = async () => {
    if (!confirm(`Confirma aplicar um acréscimo de ${markupPercent.value}% ao valor total?`)) return;
    
    savingMarkup.value = true;
    try {
        const response = await $fetch(`/api/pedidos/${id}/markup`, {
            method: 'PATCH',
            body: { markup_percent: markupPercent.value }
        });
        
        data.value.final_total = response.updated.final_total;
        alert('Markup salvo e total final atualizado!');

    } catch (e: any) {
        alert(`Erro ao salvar markup: ${e.message || 'Erro de servidor'}`);
    } finally {
        savingMarkup.value = false;
    }
}

const fetchData = async () => {
    try {
        const response = await $fetch(`/api/pedidos/${id}`); 
        data.value = response;

        if (data.value && data.value.markup_percent) {
            markupPercent.value = parseFloat(data.value.markup_percent);
        }
    } catch (e: any) {
        error.value = e.data || e; 
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);
</script>

<style scoped>
@media print {
  .print\:hidden {
    display: none !important;
  }
  .max-w-4xl.mx-auto {
    width: 100%;
    margin: 0;
    padding: 0;
  }
}
</style>