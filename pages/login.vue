<script setup>
import { ref } from 'vue'

const email = ref('admin@netmark.com') // Pré-preenchido para teste, pode limpar
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

async function handleLogin() {
    carregando.value = true
    erro.value = ''

    try {
        const { data, error } = await useFetch('/api/login', {
            method: 'POST',
            body: { email: email.value, senha: senha.value }
        })

        if (error.value) {
            erro.value = error.value.data?.message || 'Erro ao entrar.'
            return
        }

        if (data.value && data.value.success) {
           window.location.href = '/'
        }

    } catch (e) {
        erro.value = "Erro de conexão com o servidor."
        console.error(e)
    } finally {
        carregando.value = false
    }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-800">Sistema ERP</h1>
          <p class="text-gray-500 mt-2">Login Administrativo</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="email"
              type="email" 
              id="email" 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              placeholder="seu@email.com" 
              required
            >
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              v-model="senha"
              type="password" 
              id="password" 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
              placeholder="••••••••" 
              required
            >
          </div>

          <div v-if="erro" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ erro }}
          </div>

          <button type="submit" :disabled="carregando"
            class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
            <span v-if="carregando" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Verificando...
            </span>
            <span v-else>ENTRAR NO SISTEMA</span>
          </button>
        </form>
      </div>
      <div class="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
        <a href="#" class="text-sm text-orange-600 hover:text-orange-700 font-medium">Esqueceu a senha?</a>
      </div>
    </div>
  </div>
</template>