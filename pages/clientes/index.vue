<template>
  <DashboardLayout>
    <div class="p-8 bg-gray-50 min-h-screen">
      
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Meus Clientes</h1>
          <p class="text-gray-500">Gerencie sua carteira de clientes.</p>
        </div>
        <button @click="abrirModal" class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
          <span>+</span> Adicionar Cliente
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <th class="p-4">Nome</th>
              <th class="p-4">Email</th>
              <th class="p-4">Telefone</th>
              <th class="p-4">Cidade</th>
              <th class="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="cliente in clientes" :key="cliente.id" class="hover:bg-gray-50 transition-colors group">
              <td class="p-4 font-bold text-slate-700">
                 <NuxtLink :to="`/clientes/${cliente.id}`" class="hover:text-blue-600 transition">{{ cliente.nome }}</NuxtLink>
              </td>
              <td class="p-4 text-gray-500">{{ cliente.email || '-' }}</td>
              <td class="p-4 text-gray-500">{{ cliente.telefone || '-' }}</td>
              <td class="p-4">
                <span v-if="cliente.cidade" class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold uppercase">
                  {{ cliente.cidade }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="p-4 text-right">
                <NuxtLink :to="`/clientes/${cliente.id}`" class="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition">
                    Editar / Ver Histórico
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="!clientes || clientes.length === 0">
              <td colspan="5" class="p-8 text-center text-gray-500">Nenhum cliente encontrado.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL DE CADASTRO -->
      <div v-if="mostrarModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="fecharModal"></div>
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in">
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="font-bold text-lg text-slate-800">Novo Cliente</h3>
            <button @click="fecharModal" class="text-gray-400 hover:text-red-500">✕</button>
          </div>
          <form @submit.prevent="salvarCliente" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input v-model="form.nome" type="text" class="w-full border-gray-300 rounded-lg p-2 border" required>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="form.email" type="email" class="w-full border-gray-300 rounded-lg p-2 border">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input v-model="form.telefone" type="text" class="w-full border-gray-300 rounded-lg p-2 border">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input v-model="form.cidade" type="text" class="w-full border-gray-300 rounded-lg p-2 border">
            </div>
            <div class="pt-4 flex gap-3">
              <button type="button" @click="fecharModal" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancelar</button>
              <button type="submit" :disabled="salvando" class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-70">
                {{ salvando ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from '~/layouts/DashboardLayout.vue';
import { ref } from 'vue'

const mostrarModal = ref(false)
const salvando = ref(false)
const form = ref({ nome: '', email: '', telefone: '', cidade: '' })

// Carrega a lista usando a API Geral
const { data: clientes, refresh } = await useFetch('/api/clientes')

const abrirModal = () => { mostrarModal.value = true }
const fecharModal = () => { mostrarModal.value = false; form.value = { nome: '', email: '', telefone: '', cidade: '' } }

const salvarCliente = async () => {
  if (!form.value.nome) return alert('Nome obrigatório')
  salvando.value = true
  try {
    await $fetch('/api/clientes', { method: 'POST', body: form.value })
    await refresh()
    fecharModal()
  } catch (error) { alert('Erro ao salvar.') } 
  finally { salvando.value = false }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>