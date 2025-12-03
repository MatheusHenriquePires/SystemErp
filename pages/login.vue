<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-800">Sitema ERP</h1>
        <p class="text-slate-500">Login Administrativo</p>
      </div>

      <form @submit.prevent="fazerLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Email</label>
          <input v-model.trim="form.email" type="email" class="w-full border-2 border-slate-200 p-3 rounded-lg focus:border-blue-500 outline-none transition" required placeholder="admin@arnold.ai">
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Senha</label>
          <input v-model.trim="form.senha" type="password" class="w-full border-2 border-slate-200 p-3 rounded-lg focus:border-blue-500 outline-none transition" required placeholder="123456">
        </div>

        <div v-if="erro" class="p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center font-medium border border-red-200">
          {{ erro }}
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-orange-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50">
          {{ loading ? 'Conectando...' : 'ENTRAR NO SISTEMA' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // Importante para redirecionar

const router = useRouter()
const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

async function handleLogin() {
    carregando.value = true
    erro.value = ''

    try {
        // 1. Chama o seu backend (que agora está funcionando)
        const { data, error } = await useFetch('/api/login', {
            method: 'POST',
            body: { 
                email: email.value, 
                senha: senha.value 
            }
        })

        // 2. Se o backend retornou erro (ex: senha errada)
        if (error.value) {
            erro.value = error.value.data?.message || 'Erro ao entrar.'
            return
        }

        // 3. A PARTE QUE FALTA: Redirecionar se deu certo
        if (data.value && data.value.success) {
            // Força a atualização do estado de autenticação (opcional, mas bom)
            // e manda para a página de pedidos
            await navigateTo('/pedidos') 
        }

    } catch (e) {
        erro.value = "Erro de conexão."
        console.error(e)
    } finally {
        carregando.value = false
    }
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="senha" type="password" placeholder="Senha" required />
    
    <p v-if="erro" style="color: red">{{ erro }}</p>
    
    <button type="submit" :disabled="carregando">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
    </button>
  </form>
</template>