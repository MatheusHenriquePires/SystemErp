import { defineEventHandler, readMultipart, createError } from 'h3';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Inicializa a OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default defineEventHandler(async (event) => {
    // 1. Receber o arquivo PDF do Frontend
    const data = await readMultipart(event);
    const filePart = data.find(p => p.name === 'file');

    if (!filePart || !filePart.data) {
        throw createError({ statusCode: 400, message: 'Arquivo PDF não enviado.' });
    }

    // Salva temporariamente para enviar à OpenAI
    const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, filePart.data);

    try {
        // 2. Fazer Upload do arquivo para a OpenAI
        const file = await openai.files.create({
            file: fs.createReadStream(tempFilePath),
            purpose: "assistants",
        });

        // 3. Criar e Rodar uma Thread (Processo de análise)
        const run = await openai.beta.threads.createAndRun({
            assistant_id: "", // Se você tiver um assistente criado, coloque o ID aqui. Senão, definimos as instruções abaixo.
            model: "gpt-4o", // O GPT-4o é o melhor para ler arquivos
            thread: {
                messages: [
                    {
                        role: "user",
                        content: "Analise este orçamento PDF anexo. Extraia os itens das tabelas (como Chapas, Fitas, Serviços). Retorne APENAS um JSON válido.",
                        attachments: [
                            { file_id: file.id, tools: [{ type: "file_search" }] }
                        ]
                    }
                ]
            },
            instructions: `
                Você é um especialista em extração de dados de orçamentos de marcenaria.
                Analise o arquivo PDF fornecido. Extraia todos os produtos listados nas tabelas.
                
                Retorne ESTRITAMENTE um objeto JSON com a seguinte estrutura, sem markdown (backticks):
                {
                    "items": [
                        { "name": "Descrição do item", "cost": 10.50, "markup": 30 }
                    ]
                }
                
                Regras:
                - "cost" deve ser o preço unitário ou total da linha. Se for "R$ 220,00", converta para number 220.00.
                - "markup" deve ser sempre 30 (padrão).
                - Ignore itens com preço 0,00.
            `,
            tools: [{ type: "file_search" }] // Habilita a leitura do arquivo
        });

        // 4. Polling: Aguardar a resposta da OpenAI
        let runStatus = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);

        // Aguarda até completar (máximo 60 segundos para evitar timeout do navegador)
        let attempts = 0;
        while (runStatus.status !== "completed" && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2s
            runStatus = await openai.beta.threads.runs.retrieve(run.thread_id, run.id);
            
            if (runStatus.status === "failed" || runStatus.status === "cancelled") {
                throw new Error("Falha no processamento da IA: " + runStatus.last_error?.message);
            }
            attempts++;
        }

        // 5. Pegar a mensagem de resposta
        const messages = await openai.beta.threads.messages.list(run.thread_id);
        const lastMessage = messages.data
            .filter(msg => msg.role === 'assistant')
            .shift();

        if (!lastMessage || !lastMessage.content[0] || lastMessage.content[0].type !== 'text') {
            throw new Error("A IA não retornou texto válido.");
        }

        // 6. Limpeza: Deletar o arquivo da OpenAI para não ocupar espaço
        try {
            await openai.files.del(file.id);
        } catch (err) { console.error("Erro ao deletar arquivo OpenAI:", err); }

        // 7. Parse do JSON
        let jsonStr = lastMessage.content[0].text.value;
        // Limpa possíveis blocos de código Markdown (```json ... ```)
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const result = JSON.parse(jsonStr);

        return { success: true, items: result.items || [] };

    } catch (error: any) {
        console.error('Erro OpenAI:', error);
        throw createError({ statusCode: 500, message: 'Erro ao processar PDF via OpenAI: ' + error.message });
    } finally {
        // Limpa arquivo local
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
});