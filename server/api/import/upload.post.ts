import { defineEventHandler, readMultipartFormData } from 'h3';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);

  if (!form || form.length === 0) {
    return { error: true, message: "Nenhum arquivo enviado." };
  }

  const file = form.find((f) => f.type && f.filename);

  if (!file) {
    return { error: true, message: "Arquivo inválido." };
  }

  try {
    const data = await pdfParse(file.data);

    return {
      sucesso: true,
      paginas: data.numpages,
      texto: data.text,
    };

  } catch (err) {
    console.error("Erro ao processar PDF:", err);
    return { error: true, message: "Erro ao ler PDF." };
  }
});
