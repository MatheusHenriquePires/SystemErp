import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { readMultipartFormData } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);

    if (!form || !form.length) {
      return { sucesso: false, erro: "Nenhum PDF enviado." };
    }

    const pdfFile = form[0]; // primeiro arquivo enviado
    const data = new Uint8Array(pdfFile.data);

    // Carregar PDF
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let textoFinal = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const texto = content.items.map((i: any) => i.str).join(" ").trim();

      textoFinal.push(texto);
    }

    return {
      sucesso: true,
      paginas: pdf.numPages,
      texto: textoFinal,
    };
  } catch (e) {
    return {
      sucesso: false,
      erro: "Erro ao processar PDF",
      detalhe: e.message
    };
  }
});
