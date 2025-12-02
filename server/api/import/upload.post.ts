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

    // PROMPT DEFINITIVO — DENTRO DE CRASE — SEGURO
    const prompt = `
Você é um especialista em leitura de orçamentos de fornecedores (chapas, ferragens, MDF, dobradiças e itens de marcenaria).  
Seu objetivo é extrair SOMENTE produtos comercializáveis.  

Leia TODAS as páginas do PDF enviado acima e gere um JSON puro, sem texto fora do JSON, no formato:

[
  {
    "name": "Nome completo e claro do item",
    "cost": 0,
    "markup": 40,
    "price": 0
  }
]

REGRAS IMPORTANTES:
1. Identifique um produto apenas quando tiver nome + preço.
2. Forme nomes completos: categoria + tipo + espessura + dimensão + detalhes.
3. Preços podem estar como: "92,00", "R$ 178,50", "12.90", etc.
4. Converter para número: 92.00
5. markup = 40
6. price = cost * 1.4
7. Ignore: cabeçalhos, rodapés, logos, totais, frete, notas.
8. Não duplique itens.
9. Se nenhuma linha for encontrada, retorne [].
`;

    const response = await client.chat.completions.create({
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
              text: prompt
            }
          ]
        }
      ]
    });

    let items = [];

    try {
      const raw = response.choices[0].message?.content || "[]";
      items = JSON.parse(raw);
    } catch (err) {
      console.error("Falha ao converter JSON:", err);
      items = [];
    }

    return { items };

  } catch (error) {
    console.error("Erro no importador:", error);
    return { items: [] };
  }
});
