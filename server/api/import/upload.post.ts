import formidable from "formidable";
import fs from "fs";
import pdf from "pdf-parse";

export default defineEventHandler(async (event) => {
  try {
    // Ativa leitura de FormData (upload)
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(event.node.req);

    if (!files.file) {
      return { sucesso: false, mensagem: "Nenhum arquivo enviado." };
    }

    const filePath = files.file[0].filepath;
    const fileBuffer = fs.readFileSync(filePath);

    // LÊ O PDF COMPLETO PARA TEXTO
    const data = await pdf(fileBuffer);

    const texto = data.text;

    // EXTRAI ITENS COM PADRÕES: nome + preço (R$ XX,XX)
    const regex = /(.*?)(R\$ ?\d{1,3}(?:\.\d{3})*,\d{2})/g;

    const items = [];
    let match;

    while ((match = regex.exec(texto)) !== null) {
      const nome = match[1].trim();
      const precoStr = match[2].replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
      const preco = parseFloat(precoStr);

      if (!isNaN(preco)) {
        items.push({
          name: nome,
          cost: preco,
          markup: 100,
          price: preco * 2,
        });
      }
    }

    return {
      sucesso: true,
      paginas: data.numpages,
      items,
    };
  } catch (e) {
    console.error("ERRO AO PROCESSAR PDF:", e);
    return {
      sucesso: false,
      mensagem: "Erro ao processar PDF",
      erro: e.message,
    };
  }
});
