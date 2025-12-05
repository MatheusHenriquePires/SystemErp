// server/api/ler-orcamento.post.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default defineEventHandler(async (event) => {
  try {
    // 1. Ler o arquivo enviado (Multipart Form Data)
    const files = await readMultipartFormData(event);
    
    if (!files || files.length === 0) {
      throw createError({ statusCode: 400, message: 'Nenhuma imagem enviada.' });
    }

    const file = files[0];
    
    // Converte buffer para Base64
    const base64Image = Buffer.from(file.data).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    // 2. Envia para o GPT-4o Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em OCR e extração de dados de orçamentos de engenharia.
          Analise a imagem fornecida (print de tabela ou PDF) e extraia os materiais.
          
          Retorne APENAS um JSON válido contendo um array de objetos. 
          NÃO use markdown (\`\`\`json). Retorne apenas o texto cru do JSON.
          
          Formato exigido para cada item:
          {
            "material": "Descrição do item",
            "marca": "Marca se houver (ou string vazia)",
            "fornecedor": "Nome do fornecedor se houver (ou string vazia)",
            "qtd": Número (quantidade, padrão 1 se não achar),
            "preco": Número (preço unitário, float, padrão 0 se não achar)
          }`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Extraia os itens desta imagem para preencher meu sistema." },
            { type: "image_url", image_url: { url: dataUrl } }
          ],
        },
      ],
      max_tokens: 2000,
    });

    // 3. Limpeza e Retorno
    let content = response.choices[0].message.content || '[]';
    
    // Remove marcadores de código se a IA colocar
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(content);

  } catch (error: any) {
    console.error('Erro OCR:', error);
    throw createError({ 
      statusCode: 500, 
      message: 'Erro ao processar imagem: ' + error.message 
    });
  }
});