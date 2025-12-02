import pdfParse from 'pdf-parse';

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);

  if (!form || !form.length) {
    return { error: true, message: "Nenhum arquivo enviado" };
  }

  const file = form.find((f) => f.name === "file");

  if (!file) {
    return { error: true, message: "Arquivo não encontrado no formulário" };
  }

  try {
    const data = await pdfParse(file.data);
    const text = data.text;

    const regex = /R\$ ?\d{1,3}(?:\.\d{3})*,\d{2}/g;
    const prices = text.match(regex) || [];

    return {
      sucesso: true,
      paginas: data.numpages,
      precos: prices
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Erro ao processar PDF"
      
    };
  }
});
