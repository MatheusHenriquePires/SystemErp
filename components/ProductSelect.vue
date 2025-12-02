<template>
  <div class="relative">
    <select 
      :value="modelValue" 
      @change="onSelect($event.target.value)"
      class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
    >
      <option value="" disabled selected>Selecione um Produto/Serviço</option>
      <option v-for="prod in products" :key="prod.id" :value="prod.id">
        {{ prod.nome }} - R$ {{ Number(prod.preco).toFixed(2) }}
      </option>
    </select>
  </div>
</template>

<script setup>
const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue', 'select']);

// Busca produtos da API
const { data: products } = await useFetch('/api/produtos');

function onSelect(id) {
  const selectedProduct = products.value.find(p => p.id == id);
  emit('update:modelValue', id);
  emit('select', selectedProduct); // Manda o produto inteiro para preencher o preço sozinho
}
</script>