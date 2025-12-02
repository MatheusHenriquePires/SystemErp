import formidable from "formidable";
import fs from "fs";
import pdf from "pdf-parse";

// Desliga o bodyParser do Nitro para permitir multipart
export default defineEventHandler(async (event) => {
  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    const req = event.node.req;

    const dataForm = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    if (!dataForm.files.file) {
      return { sucesso: false, mensagem: "Nenhum arquivo enviado." };
    }

    const file = dataForm.files.file[0];
    const buffer = fs.readFileSync(file.filepath);

    const info = await pdf(buffer);

    const texto = info.text;

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
      paginas: info.numpages,
      items,
    };
  } catch (e) {
    console.error("ERRO AO PROCESSAR:", e);
    return {
      sucesso: false,
      mensagem: "Erro interno",
      erro: e.message,
    };
  }
});
