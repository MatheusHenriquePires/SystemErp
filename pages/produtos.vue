<template>
  <div class="flex min-h-screen bg-slate-50 font-sans text-slate-900">
    
    <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div class="p-6 flex items-center gap-2 border-b border-slate-100">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
        <span class="font-bold text-xl tracking-tight text-blue-900">Arnold ERP</span>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink to="/" class="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">📊</span> Dashboard
        </NuxtLink>
        <NuxtLink to="/clientes" class="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium cursor-pointer flex items-center gap-3 transition">
          <span class="text-lg">👥</span> Clientes
        </NuxtLink>
        <div class="px-3 py-2 text-blue-600 bg-blue-50 rounded-md font-medium cursor-pointer flex items-center gap-3">
          <span class="text-lg">📦</span> Produtos
        </div>
      </nav>
    </aside>

    <main class="flex-1 p-8">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Catálogo</h1>
          <p class="text-slate-500">Produtos e Serviços disponíveis.</p>
        </div>
        <button @click="mostrarModal = true" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2">
          <span>+</span> Novo Item
        </button>
      </header>

      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th class="px-6 py-4 font-medium">Nome</th>
              <th class="px-6 py-4 font-medium">Tipo</th>
              <th class="px-6 py-4 font-medium">Estoque</th>
              <th class="px-6 py-4 font-medium text-right">Preço</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in produtos" :key="item.id" class="hover:bg-slate-50 transition">
              <td class="px-6 py-4 font-medium text-slate-900">{{ item.nome }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs font-semibold uppercase" 
                  :class="item.tipo === 'servico' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                  {{ item.tipo }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-500">
                <span v-if="item.tipo === 'servico'">-</span>
                <span v-else :class="item.estoque_atual < 5 ? 'text-red-600 font-bold' : ''">
                  {{ item.estoque_atual }} un
                </span>
              </td>
              <td class="px-6 py-4 text-right font-bold text-emerald-600">
                R$ {{ Number(item.preco).toFixed(2) }}
              </td>
            </tr>
            <tr v-if="produtos?.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-400">Nenhum item cadastrado.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="mostrarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-xl shadow-xl w-96">
          <h2 class="text-xl font-bold mb-4 text-slate-800">Novo Item</h2>
          
          <form @submit.prevent="salvarProduto">
            <div class="flex gap-4 mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.tipo" value="produto" class="text-blue-600">
                <span>Produto Físico</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="form.tipo" value="servico" class="text-purple-600">
                <span>Serviço</span>
              </label>
            </div>

            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Nome do Item</label>
              <input v-model="form.nome" type="text" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" required placeholder="Ex: Ensaio Fotográfico" />
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label class="block text-sm font-medium mb-1">Preço (R$)</label>
                <input v-model="form.preco" type="number" step="0.01" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" required placeholder="0.00" />
              </div>
              <div v-if="form.tipo === 'produto'">
                <label class="block text-sm font-medium mb-1">Estoque</label>
                <input v-model="form.estoque" type="number" class="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" placeholder="0" />
              </div>
            </div>

            <div class="flex gap-2 justify-end">
              <button type="button" @click="mostrarModal = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
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
const { data: produtos, refresh } = await useFetch('/api/produtos')

const mostrarModal = ref(false)
const salvando = ref(false)
const form = ref({ nome: '', preco: '', estoque: '', tipo: 'produto' })

async function salvarProduto() {
  salvando.value = true
  try {
    await $fetch('/api/produtos', {
      method: 'POST',
      body: form.value
    })
    form.value = { nome: '', preco: '', estoque: '', tipo: 'produto' }
    mostrarModal.value = false
    refresh() 
  } catch (e) {
    alert('Erro ao cadastrar produto')
  } finally {
    salvando.value = false
  }
}
</script>