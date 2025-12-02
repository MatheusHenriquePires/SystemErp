<script setup>
const resultado = ref(null);

const uploadPDF = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const form = new FormData();
  form.append("file", file);

  resultado.value = await $fetch("/api/importar-pdf", {
    method: "POST",
    body: form
  });
};
</script>

<template>
  <div class="p-6">
    <input type="file" accept="application/pdf" @change="uploadPDF">

    <div v-if="resultado">
      <pre>{{ resultado }}</pre>
    </div>
  </div>
</template>
