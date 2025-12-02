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
Você é um especialista em leitura de orçamentos de fornecedores (chapas, ferragens, MDF, dobradiças e itens de marcenaria).  
Seu objetivo é extrair SOMENTE produtos comercializáveis.  

Leia TODAS as páginas do PDF enviado, detecte tabelas, colunas e padrões de preços, e gere um JSON **PURO**, SEM TEXTO FORA DO JSON, no formato:

[
  {
    "name": "Nome completo e claro do item",
    "cost": 0,
    "markup": 40,
    "price": 0
  }
]

REGRAS OBRIGATÓRIAS:

1. **Identifique um produto apenas quando tiver nome + preço**.
2. Seja inteligente com nomes:
   - Inclua a categoria: ("Chapa MDF", "Dobradiça", "Parafuso", "Corrediça")
   - Inclua espessura e dimensões se existirem: (6mm, 15mm, 2,75x1,83)
   - Inclua o tipo: (Cru, Branco, Texturizado, Fosco)
3. Extraia o preço corretamente:
   - Formatos válidos: "92,00", "R$ 178,50", "178.50", "12,90 un", "R$25,00"
   - Converter para número: 92.00
4. Campos obrigatórios:
   - "name": string clara
   - "cost": número
   - "markup": SEMPRE 40
   - "price": cost * 1.4
5. Nunca repita linhas ou itens.
6. Ignore completamente:
   - Cabeçalhos
   - Rodapés
   - Numeração de página
   - Logo, CNPJ, telefone
   - Totais gerais ("TOTAL", "SOMA", "PEDIDO")
7. Se o PDF contiver variações do mesmo produto (ex: 6mm, 9mm, 15mm), gerar itens separados.
8. Se alguma página não tiver itens, ignore.
9. Retorne **apenas JSON puro**, sem comentários, sem explicações.

Se nenhum produto for encontrado, retorne: []

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
