import { IncomingForm } from "formidable";
import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

export default defineEventHandler(async (event) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true });

    form.parse(event.node.req, async (err, _, files) => {
      if (err) return reject(err);

      try {
        const file = files.file;
        if (!file) {
          return resolve({ sucesso: false, erro: "Nenhum PDF enviado." });
        }

        const data = new Uint8Array(fs.readFileSync(file.filepath));
        const pdf = await pdfjsLib.getDocument({ data }).promise;

        let linhas: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();

          const texto = content.items.map((item: any) => item.str).join(" ");
          texto.split(/\n| {2,}/g).forEach(l => {
            const clean = l.trim();
            if (clean.length > 5) linhas.push(clean);
          });
        }

        // ======== PARSER INTELIGENTE PARA PRODUTOS ========
        const produtos = [];

        for (const linha of linhas) {
          const priceMatch = linha.match(/R\$ ?(\d{1,3}(?:\.\d{3})*,\d{2})/);

          if (!priceMatch) continue;

          const priceStr = priceMatch[1].replace(/\./g, "").replace(",", ".");
          const preco = parseFloat(priceStr);

          let nome = linha.replace(priceMatch[0], "").trim();

          // Remover unidades no final
          nome = nome.replace(/\/un$/i, "").trim();

          produtos.push({
            nome,
            preco_custo: preco,
            margem: 40,
            preco_venda: +(preco * 1.4).toFixed(2),
          });
        }

        resolve({
          sucesso: true,
          total: produtos.length,
          produtos,
        });

      } catch (e) {
        resolve({
          sucesso: false,
          erro: "Falha ao ler PDF",
          detalhe: e.message,
        });
      }
    });
  });
});
