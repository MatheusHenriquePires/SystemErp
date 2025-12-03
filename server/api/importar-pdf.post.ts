import { readMultipartFormData } from "h3";
import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  try {
    // 🔥 Lê o PDF enviado pelo <input type="file">
    const form = await readMultipartFormData(event);
    const file = form?.[0];

    if (!file) {
      return { sucesso: false, erro: "Nenhum PDF enviado." };
    }

    // Converte PDF em base64 (para enviar como imagem para a API)
    const base64 = file.data.toString("base64");

    // 🔥 Cliente OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 🔥 Integração com GPT-4o Mini (Visão já é nativa neste modelo)
    const result = await client.chat.completions.create({
      model: "gpt-4o-mini", // <--- CORRIGIDO AQUI (Vision é nativo)
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_image",
              image_url: {
                 url: `data:application/pdf;base64,${base64}` // Formato correto para envio de base64
              }
            },
            {
              type: "text",
              text: `
Extraia do PDF todos os produtos e retorne exatamente no formato JSON abaixo:

[
  {
    "nome": "",
    "preco_custo": 0,
    "margem": 40,
    "preco_venda": 0
  }
]

Regra:
- Nome deve conter: categoria + produto + dimensões.
- O preço deve ser convertido para número (ex: R$ 92,00 → 92.00)
- "margem" = 40 sempre.
- "preco_venda" = preco_custo * 1.4
`
            }
          ]
        }
      ]
    });

    // 🔥 Conteúdo retornado pela IA (um JSON como texto)
    let text = result.choices[0].message?.content || "";
    
    // Limpeza de segurança (caso a IA retorne ```json ... ```)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const produtos = JSON.parse(text);

    return {
      sucesso: true,
      total: produtos.length,
      produtos
    };

  } catch (err: any) {
    console.error("Erro OpenAI:", err);
    return {
      sucesso: false,
      erro: "Falha ao processar PDF",
      detalhe: err.message
    };
  }
});