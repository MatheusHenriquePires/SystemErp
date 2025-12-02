import { readMultipartFormData } from "h3";
import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    const file = form?.[0];

    if (!file) {
      return { items: [] };
    }

    const base64 = file.data.toString("base64");

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // 🔥 ENVIA O PDF COMPLETO DIRETO PARA O GPT-4O VISION
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini-vision",
      temperature: 0,
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: `data:application/pdf;base64,${base64}`
            },
            {
              type: "text",
              text: `
Você é um extrator profissional de orçamentos de fornecedores.

Leia TODAS as páginas do PDF enviado acima e extraia os produtos com os seguintes dados:

{
  "name": "Nome do item",
  "cost": 0,
  "markup": 40,
  "price": 0
}

Regras obrigatórias:
- Ignore datas, logos, cabeçalhos, notas, números de pedido.
- Extraia apenas itens com nome + preço.
- Normalize o nome (sem abreviações estranhas).
- Converta R$ 92,00 → 92.00
- markup FIXO = 40
- price = cost * 1.4
- Retorne SOMENTE JSON puro, sem texto fora do JSON.
- Se não achar nenhum item, retorne [].
`
            }
          ]
        }
      ]
    });

    let items = [];
    let content = completion.choices[0].message?.content || "[]";

    try {
      items = JSON.parse(content);
    } catch (e) {
      console.error("Falha ao converter JSON", content);
      items = [];
    }

    return { items };

  } catch (e) {
    console.error("ERRO:", e);
    return { items: [] };
  }
});
