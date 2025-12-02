import { readMultipartFormData } from "h3";
import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    const file = form?.[0];

    if (!file) {
      return { items: [] };
    }

    // PDF -> base64
    const base64 = file.data.toString("base64");

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // 🔥 1. Envia o PDF para a IA
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini-vision",
      temperature: 0,
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
Leia o PDF e extraia itens de orçamento.  
Retorne SOMENTE no formato JSON:

[
  {
    "name": "Nome do item",
    "cost": 0,
    "markup": 40,
    "price": 0
  }
]

Regras:
- O campo "name" deve ser explícito: categoria + item + dimensões se existirem.
- "cost" deve ser sempre número (ex: R$ 92,00 -> 92.00).
- "markup" = 40 sempre.
- "price" = cost * 1.4
- Se encontrar 0 itens, retorne "[]".
`
            }
          ]
        }
      ]
    });

    // 🔥 2. Decodifica o JSON
    const raw = completion.choices[0].message?.content || "[]";

    let items = [];
    try {
      items = JSON.parse(raw);
    } catch (e) {
      console.error("Erro ao parsear JSON:", raw);
      return { items: [] };
    }

    return { items };

  } catch (error) {
    console.error(error);
    return { items: [] };
  }
});
