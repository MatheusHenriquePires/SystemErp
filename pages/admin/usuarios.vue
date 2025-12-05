<template>
  <DashboardLayout>
    <div class="max-w-6xl mx-auto px-4 py-8">
      
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-900">👥 Gestão de Equipe</h1>
        <button @click="abrirModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow flex items-center gap-2">
          <span>+</span> Novo Usuário
        </button>
      </div>

      <div class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Cargo</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in usuarios" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ user.nome }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ user.email }}</td>
              <td class="px-6 py-4 text-center">
                <span :class="`px-2 py-1 text-xs font-bold rounded-full ${user.cargo === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`">
                  {{ user.cargo === 'admin' ? 'Administrador' : 'Vendedor' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <button class="text-gray-400 hover:text-red-600 font-bold" title="Excluir (Em breve)">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="usuarios.length === 0" class="p-8 text-center text-gray-500">
            Nenhum usuário encontrado além de você.
        </div>
      </div>

      <div v-if="mostrarModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">Novo Membro</h2>
            <button @click="mostrarModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form @submit.prevent="salvarUsuario" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input v-model="form.nome" type="text" required class="w-full border rounded-md p-2 mt-1" placeholder="Ex: João Silva">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">E-mail de Acesso</label>
              <input v-model="form.email" type="email" required class="w-full border rounded-md p-2 mt-1" placeholder="joao@empresa.com">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Senha Provisória</label>
              <input v-model="form.senha" type="password" required class="w-full border rounded-md p-2 mt-1" placeholder="******">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Cargo</label>
              <select v-model="form.cargo" class="w-full border rounded-md p-2 mt-1 bg-white">
                <option value="vendedor">Vendedor (Acesso Padrão)</option>
                <option value="admin">Administrador (Acesso Total)</option>
              </select>
            </div>

            <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button type="button" @click="mostrarModal = false" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
              <button type="submit" :disabled="salvando" class="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {{ salvando ? 'Salvando...' : 'Criar Usuário' }}
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

const usuarios = ref<any[]>([]);
const mostrarModal = ref(false);
const salvando = ref(false);

const form = ref({
  nome: '',
  email: '',
  senha: '',
  cargo: 'vendedor'
});

const carregarUsuarios = async () => {
  try {
    const data = await $fetch('/api/admin/usuarios');
    usuarios.value = data as any[];
  } catch (error) {
    console.error('Erro ao carregar usuários', error);
  }
};

const abrirModal = () => {
  form.value = { nome: '', email: '', senha: '', cargo: 'vendedor' };
  mostrarModal.value = true;
};

const salvarUsuario = async () => {
  salvando.value = true;
  try {
    await $fetch('/api/admin/usuarios', {
      method: 'POST',
      body: form.value
    });
    
    alert('Usuário criado com sucesso!');
    mostrarModal.value = false;
    await carregarUsuarios(); // Atualiza a lista

  } catch (error: any) {
    const msg = error.data?.message || 'Erro ao criar usuário.';
    alert(msg);
  } finally {
    salvando.value = false;
  }
};

onMounted(carregarUsuarios);
useHead({ title: 'Gestão de Equipe' });
</script>