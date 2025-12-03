import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

// Função auxiliar para decodificar o token (igual fizemos nos outros arquivos)
function lerToken(token: string) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(base64, 'base64');
        return JSON.parse(buffer.toString('utf-8'));
    } catch (e) {
        return null;
    }
}

export default defineEventHandler(async (event) => {
    // 1. Ler o corpo da requisição (os dados do novo pedido)
    const body = await readBody(event)
    
    // 2. Segurança e Token (A Correção vai aqui)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)

    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida ou expirada. Faça login novamente.' })
    }

    // 3. Validação dos dados (Opcional, mas recomendado)
    if (!body.cliente_id || !body.itens || body.itens.length === 0) {
        throw createError({ statusCode: 400, message: 'Dados do pedido incompletos (cliente ou itens faltando)' })
    }

    try {
        // 4. Inserir o Pedido no Banco
        // Ajuste os nomes das colunas (cliente_id, total, status) conforme seu banco real
        const novoPedido = await sql`
            INSERT INTO pedidos (
                empresa_id, 
                cliente_id, 
                data_criacao, 
                status, 
                total
            ) VALUES (
                ${usuario.empresa_id}, 
                ${body.cliente_id}, 
                NOW(), 
                'PENDENTE', 
                ${body.total || 0}
            )
            RETURNING id
        `
        
        const pedidoId = novoPedido[0].id

        // 5. (Opcional) Se você precisar salvar os itens do pedido em outra tabela:
        // Isso seria um loop para inserir na tabela 'pedidos_itens'
        /*
        for (const item of body.itens) {
            await sql`INSERT INTO pedidos_itens (pedido_id, produto_id, qtd, preco) ...`
        }
        */

        return { success: true, id: pedidoId, message: "Pedido criado com sucesso!" }

    } catch (error) {
        console.error("Erro ao criar pedido:", error)
        throw createError({ statusCode: 500, message: 'Erro interno ao salvar pedido.' })
    }
})