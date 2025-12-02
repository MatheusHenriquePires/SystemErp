import { readMultipartFormData } from "h3";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    if (!form || !form[0]) {
      return { sucesso: false, erro: "Nenhum PDF enviado." };
    }

    const pdfFile = form[0];
    const data = new Uint8Array(pdfFile.data);

    // 🔥 DESATIVA WORKER (HOSTINGER NECESSÁRIO)
    pdfjsLib.GlobalWorkerOptions.workerSrc = null;

    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let paginas = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const texto = content.items
        .map((item: any) => item.str)
        .join(" ")
        .trim();

      paginas.push(texto);
    }

    return {
      sucesso: true,
      paginas: pdf.numPages,
      texto: paginas,
    };

  } catch (err) {
    console.error("ERRO PDF:", err);
    return {
      sucesso: false,
      erro: "Falha ao ler PDF",
      detalhe: err.message,
    };
  }
});
