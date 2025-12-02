import { readMultipartFormData } from "h3";
import OpenAI from "openai";

// Importação do pdfjs-dist (funciona em qualquer ambiente)
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.js";

// Configura o worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default defineEventHandler(async (event) => {
  try {
    // 1. Recebe o PDF do front-end
    const form = await readMultipartFormData(event);
    const file = form?.find((f) => f.name === "file");

    if (!file) {
      return { items: [], error: "Nenhum arquivo recebido" };
    }

    const buffer = file.data;

    // 2. Carrega o PDF
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const totalPaginas = pdf.numPages;

    const paginasBase64: string[] = [];

    // 3. Converte cada página em PNG usando o Canvas interno do pdfjs-dist
    for (let n = 1; n <= totalPaginas; n++) {
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: 2 });

      // Canvas interno do pdfjs
      const { Canvas, Image } = await import("canvas");
      const canvas = new Canvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const pngBuffer = canvas.toBuffer("image/png");
      paginasBase64.push(pngBuffer.toString("base64"));
    }

    // 4. Envia para GPT Vision extrair os itens
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Extraia uma lista de produtos deste orçamento.
Sempre responda SOMENTE JSON, no formato:

[
  { "name": "", "cost": 0, "markup": 40, "price": 0 }
]

Regras:
- "name": nome do produto
- "cost": preço encontrado no PDF
- "markup": sempre padrão 40
- "price": cost * (1 + markup/100)
Se não houver preço na linha, ignore o item.
`;

    const imagens = paginasBase64.map((img) => ({
      type: "input_image",
      image_url: `data:image/png;base64,${img}`,
    }));

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini-vision",
      messages: [
        { role: "user", content: [...imagens, { type: "text", text: prompt }] },
      ],
      max_tokens: 3000,
    });

    let items = [];

    try {
      items = JSON.parse(response.choices[0].message?.content || "[]");
    } catch (err) {
      console.error("Erro ao converter JSON:", err);
    }

    return {
      sucesso: true,
      paginas: totalPaginas,
      items,
    };
  } catch (err) {
    console.error("Erro no importador:", err);
    return {
      sucesso: false,
      items: [],
      error: "Falha ao processar PDF",
    };
  }
});
