import { readMultipartFormData } from 'h3';
import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    const file = form?.find((f) => f.name === 'file');

    if (!file) {
      return { sucesso: false, items: [], error: 'Nenhum arquivo recebido' };
    }

    const pdfBase64 = file.data.toString("base64");

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Extraia deste orçamento os produtos e preços.

Retorne APENAS JSON no formato:
[
  { "name": "", "cost": 0, "markup": 40, "price": 0 }
]

Regras:
- name = nome da peça
- cost = preço encontrado no PDF
- markup = 40
- price = cost * 1.4
- Ignore itens sem preço.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini-vision",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              file_url: `data:application/pdf;base64,${pdfBase64}`,
            },
            { type: "text", text: prompt },
          ],
        },
      ],
      max_tokens: 3000,
    });

    let items = [];
    try {
      items = JSON.parse(response.choices[0].message.content || "[]");
    } catch (err) {
      console.error("Falha ao converter JSON", err);
    }

    return {
      sucesso: true,
      paginas: 1, // não precisamos contar páginas
      items,
    };
  } catch (error) {
    console.error("Erro ao processar PDF", error);
    return {
      sucesso: false,
      items: [],
      error: "Falha ao processar PDF",
    };
  }
});
