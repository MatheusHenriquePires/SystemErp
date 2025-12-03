import { readMultipartFormData } from "h3";
import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  try {
    // 1. Lê o arquivo enviado
    const form = await readMultipartFormData(event);
    const file = form?.[0];

    if (!file) {
      return { sucesso: false, erro: "Nenhum arquivo enviado." };
    }

    // 2. Prepara a imagem/PDF em Base64
    const base64 = file.data.toString("base64");
    // Define o mime type (tenta adivinhar ou usa padrao)
    const mimeType = file.type || "image/jpeg"; 

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 3. Envia para o GPT-4o-mini
    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url", // <--- CORRIGIDO: O nome correto é image_url
              image_url: {
                 // Enviamos o base64 montado corretamente
                 url: `data:${mimeType};base64,${base64}` 
              }
            },
            {
              type: "text",
              text: `
Analise esta imagem/nota fiscal. Extraia todos os produtos e retorne APENAS um JSON puro (sem markdown) neste formato:

[
  {
    "nome": "Nome do Produto",
    "preco_custo": 10.50,
    "margem": 40,
    "preco_venda": 14.70
  }
]

Regras:
- "preco_venda" deve ser numérico (ponto flutuante).
- Se não achar o preço, coloque 0.
- Ignore itens que não sejam produtos (ex: frete, impostos).
`
            }
          ]
        }
      ],
      max_tokens: 2000,
    });

    // 4. Limpa e processa a resposta
    let text = result.choices[0].message?.content || "";
    // Remove blocos de código markdown se a IA colocar
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const produtos = JSON.parse(text);

    return {
      sucesso: true,
      produtos
    };

  } catch (err: any) {
    console.error("Erro API IA:", err);
    return {
      sucesso: false,
      erro: "Erro ao processar arquivo",
      detalhe: err.message
      
    };
  }
});