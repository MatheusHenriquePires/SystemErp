<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-800">Arnold.ai</h1>
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

        <button type="submit" :disabled="loading" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50">
          {{ loading ? 'Conectando...' : 'ENTRAR NO SISTEMA' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const form = ref({ email: '', senha: '' })
const loading = ref(false)
const erro = ref('')
const router = useRouter()

async function fazerLogin() {
  loading.value = true
  erro.value = ''
  
  try {
    const resposta = await $fetch('/api/login', {
      method: 'POST',
      body: form.value
    })
    
    if (resposta.sucesso) {
      // Força o redirecionamento
      window.location.href = '/'
    }
  } catch (e) {
    console.error(e)
    erro.value = 'Email ou senha incorretos (ou erro no servidor).'
  } finally {
    loading.value = false
  }
}
</script>