<template>
  <div class="flex min-h-screen bg-slate-50 font-sans text-slate-900">
    
    <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div class="p-6 flex items-center gap-2 border-b border-slate-100">
        <div class="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
        <span class="font-bold text-xl tracking-tight text-blue-900">Sistema ERP</span>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink to="/" class="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">📊</span> Dashboard
        </NuxtLink>
        <div class="px-3 py-2 text-orange-600 bg-blue-50 rounded-md font-medium cursor-pointer flex items-center gap-3">
          <span class="text-lg">👥</span> Clientes
        </div>
      </nav>
    </aside>

    <main class="flex-1 p-8">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Meus Clientes</h1>
          <p class="text-slate-500">Gerencie sua carteira de clientes.</p>
        </div>
        <button @click="mostrarModal = true" class="bg-orange-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2">
          <span>+</span> Adicionar Cliente
        </button>
      </header>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4 font-medium">Nome</th>
              <th class="px-6 py-4 font-medium">Email</th>
              <th class="px-6 py-4 font-medium">Telefone</th>
              <th class="px-6 py-4 font-medium">Cidade</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="cliente in clientes" :key="cliente.id" class="hover:bg-slate-50 transition">
              <td class="px-6 py-4 font-medium text-slate-900">{{ cliente.nome }}</td>
              <td class="px-6 py-4 text-slate-500">{{ cliente.email || '-' }}</td>
              <td class="px-6 py-4 text-slate-500">{{ cliente.telefone || '-' }}</td>
              <td class="px-6 py-4 text-slate-500">
                <span v-if="cliente.cidade" class="px-2 py-1 bg-slate-100 rounded text-xs font-semibold uppercase text-slate-600">{{ cliente.cidade }}</span>
                <span v-else>-</span>
              </td>
            </tr>
            <tr v-if="clientes?.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-400">Nenhum cliente cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl shadow-xl w-96">
          <h2 class="text-xl font-bold mb-4 text-slate-800">Novo Cliente</h2>
          
          <form @submit.prevent="salvarCliente">
            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Nome Completo</label>
              <input v-model="form.nome" type="text" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" required placeholder="Ex: João da Silva" />
            </div>

            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Email</label>
              <input v-model="form.email" type="email" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" placeholder="joao@email.com" />
            </div>

            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Telefone / WhatsApp</label>
              <input v-model="form.telefone" type="text" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" placeholder="(11) 99999-9999" />
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium mb-1">Cidade</label>
              <input v-model="form.cidade" type="text" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" placeholder="São Paulo" />
            </div>

            <div class="flex gap-2 justify-end">
              <button type="button" @click="mostrarModal = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
              <button type="submit" class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-blue-700 font-medium">
                {{ salvando ? 'Salvando...' : 'Cadastrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
// 1. Busca os clientes ao carregar a página
const { data: clientes, refresh } = await useFetch('/api/clientes')

// 2. Lógica do Modal
const mostrarModal = ref(false)
const salvando = ref(false)
const form = ref({ nome: '', email: '', telefone: '', cidade: '' })

async function salvarCliente() {
  salvando.value = true
  try {
    await $fetch('/api/clientes', {
      method: 'POST',
      body: form.value
    })
    // Limpa o form e atualiza a lista
    form.value = { nome: '', email: '', telefone: '', cidade: '' }
    mostrarModal.value = false
    refresh() 
  } catch (e) {
    alert('Erro ao cadastrar cliente')
  } finally {
    salvando.value = false
  }
}
</script>