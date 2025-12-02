import { defineEventHandler } from "h3";
import formidable from "formidable";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

export default defineEventHandler(async (event) => {
  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    if (!files.file) {
      return { error: true, message: "Nenhum arquivo enviado" };
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    const pdfData = new Uint8Array(fs.readFileSync(file.filepath));

    // Lê o PDF com pdfjs-dist
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;

    let textoExtraido = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      textoExtraido += pageText + "\n\n";
    }

    // regex para pegar preços
    const regexPreco = /R\$ ?\d{1,3}(?:\.\d{3})*,\d{2}/g;
    const precos = textoExtraido.match(regexPreco) || [];

    return {
      sucesso: true,
      paginas: pdf.numPages,
      texto: textoExtraido.substring(0, 2000),
      precos,
    };
  } catch (err) {
    console.error("Erro ao ler PDF:", err);
    return { error: true, message: "Falha ao processar o PDF" };
  }
});
