<template>
  <div class="relative">
    <select 
      :value="modelValue" 
      @change="$emit('update:modelValue', $event.target.value)"
      class="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer text-slate-700"
      :class="{'text-slate-400': !modelValue}"
      required
    >
      <option value="" disabled selected>Selecione o Cliente</option>
      <option v-for="customer in customerList" :key="customer.id" :value="customer.id">
        {{ customer.name }} ({{ customer.email }})
      </option>
    </select>
    
    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
      <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
    </div>

    <p v-if="customerList.length === 0" class="text-xs text-red-500 mt-1">
      Nenhum cliente encontrado. <NuxtLink to="/clientes" class="underline">Cadastre um aqui</NuxtLink>.
    </p>
  </div>
</template>

<script setup>
const props = defineProps(['modelValue']);
defineEmits(['update:modelValue']);

// Busca os clientes usando a API que já criamos
const { data: customers } = await useFetch('/api/clientes');

// Garante que seja um array, mesmo que a API falhe
const customerList = computed(() => customers.value || []);
</script>