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
// Busca todos os clientes para a lista suspensa
const { data: customers } = await useFetch('/api/customers');
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>