import { readMultipartFormData } from "h3";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import path from "path";

export default defineEventHandler(async (event) => {
  try {
    // ====== 1. Configuração obrigatória do worker (HOSTINGER PRECISA!) ======
    pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/build/pdf.worker.js"
    );

    // ====== 2. Receber arquivo ======
    const form = await readMultipartFormData(event);

    if (!form || !form.length) {
      return { sucesso: false, erro: "Nenhum PDF enviado." };
    }

    const pdfFile = form[0];
    const data = new Uint8Array(pdfFile.data);

    // ====== 3. Carregar PDF ======
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    const paginas = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const texto = content.items.map((i: any) => i.str).join(" ").trim();
      paginas.push(texto);
    }

    return {
      sucesso: true,
      paginas: paginas.length,
      texto: paginas,
    };

  } catch (e: any) {
    console.error("ERRO AO LER PDF:", e); // LOG NO SERVIDOR
    return {
      sucesso: false,
      erro: "Falha ao processar PDF",
      detalhe: e?.message || String(e),
    };
  }
});
