<script setup>
// Não precisa importar ref ou navigateTo manualmente no Nuxt (são automáticos)
// Mas se preferir explícito:
import { ref } from 'vue'

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

async function handleLogin() {
    carregando.value = true
    erro.value = ''

    try {
        // 1. Chama o backend
        const { data, error } = await useFetch('/api/login', {
            method: 'POST',
            body: { 
                email: email.value, 
                senha: senha.value 
            }
        })


        // 2. Trata erro do backend
        if (error.value) {
            erro.value = error.value.data?.message || 'Erro ao entrar.'
            
            return
        }

        // 3. Sucesso: Redireciona
        if (data.value && data.value.success) {
            await navigateTo('/pedidos') 
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
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-800">Sistema ERP</h1>
        <p class="text-slate-500">Login Administrativo</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Email</label>
          <input 
            v-model.trim="email" 
            type="email" 
            class="w-full border-2 border-slate-200 p-3 rounded-lg focus:border-blue-500 outline-none transition" 
            required 
            placeholder="admin@exemplo.com"
          >
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Senha</label>
          <input 
            v-model.trim="senha" 
            type="password" 
            class="w-full border-2 border-slate-200 p-3 rounded-lg focus:border-blue-500 outline-none transition" 
            required 
            placeholder="******"
          >
        </div>

        <div v-if="erro" class="p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center font-medium border border-red-200">
          {{ erro }}
        </div>

        <button 
          type="submit" 
          :disabled="carregando" 
          class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ carregando ? 'Conectando...' : 'ENTRAR NO SISTEMA' }}
        </button>

      </form>
    </div>
  </div>
</template>