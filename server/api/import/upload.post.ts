import { readMultipartFormData } from "h3";
import OpenAI from "openai";
import pdf2img from "pdf-img-convert";

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event);
    const file = form?.[0];

    if (!file) return { items: [] };

    // Converte PDF para imagens
    const pages = await pdf2img.convert(file.data);

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    let allItems = [];

    for (const page of pages) {
      const base64 = Buffer.from(page).toString("base64");

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini-vision",
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "input_image",
                image_url: `data:image/png;base64,${base64}`,
              },
              {
                type: "text",
                text: `
Leia a imagem como se fosse uma página de orçamento.
Extraia nome do item + preço.  
Retorne somente JSON no formato:

[
  {
    "name": "Nome do produto",
    "cost": 0,
    "markup": 40,
    "price": 0
  }
]

Se não existir nenhum item na página, retorne [].
`
              }
            ]
          }
        ]
      });

      let parsed = [];
      try {
        parsed = JSON.parse(completion.choices[0].message?.content || "[]");
      } catch (e) {
        parsed = [];
      }

      allItems.push(...parsed);
    }

    return { items: allItems };

  } catch (e) {
    console.error(e);
    return { items: [] };
  }
});
