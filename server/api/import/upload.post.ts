import { defineEventHandler } from 'h3'
import formidable from 'formidable'
import fs from 'fs'
import pdfParse from 'pdf-parse'

// Desabilita o body parser do Nitro
export default defineEventHandler(async (event) => {
  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    // Parse multipart/form-data
    const { files } = await new Promise((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    if (!files.file) {
      return {
        error: true,
        message: "Nenhum arquivo enviado"
      };
    }

    const uploadedFile = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    const filePath = uploadedFile.filepath;

    // Lê o PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);

    const texto = data.text || "";

    // Expressão para capturar preços
    const regexPreco = /R\$ ?\d{1,3}(?:\.\d{3})*,\d{2}/g;
    const precos = texto.match(regexPreco) || [];

    // Monta retorno (ajuste conforme sua regra)
    const response = {
      sucesso: true,
      paginas: data.numpages,
      textoExtraido: texto.substring(0, 1500), // Para não explodir payload
      precosEncontrados: precos,
    };

    return response;

  } catch (err: any) {
    console.error("Erro no upload.post.ts:", err);

    return {
      error: true,
      message: "Erro ao processar PDF",
      detalhe: err?.message,
    };
  }
});
