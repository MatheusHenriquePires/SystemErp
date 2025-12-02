<template>
  <select 
    :value="modelValue" 
    @change="$emit('update:modelValue', $event.target.value)"
    class="w-full border p-2 rounded-lg focus:ring-blue-500"
    required
  >
    <option value="" disabled>Selecione o Cliente</option>
    <option v-for="customer in customers" :key="customer.id" :value="customer.id">
      {{ customer.name }} ({{ customer.email }})
    </option>
  </select>
</template>

<script setup>
// Nota: O endpoint correto é /api/clientes (que criamos para a listagem)
const { data: customers } = await useFetch('/api/clientes'); 

// Extração da lista de dentro do fetch (garantindo que seja um array)
const customerList = computed(() => {
  return customers.value || [];
});

defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>