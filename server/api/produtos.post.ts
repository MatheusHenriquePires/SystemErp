import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

// Função auxiliar para decodificar o token
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
    // 1. Ler o corpo da requisição
    const body = await readBody(event)
    
    // 2. Segurança e Token (Mantido igual ao original)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)

    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida ou expirada. Faça login novamente.' })
    }

    // 3. Validação CORRETA para PRODUTOS (Mudamos de cliente_id para nome/preco)
    if (!body.nome || !body.preco) {
        throw createError({ 
            statusCode: 400, 
            message: 'Dados do produto incompletos. Nome e Preço são obrigatórios.' 
        })
    }

    try {
        // 4. Inserir o PRODUTO no Banco (Trocamos 'pedidos' por 'produtos')
        // Estou usando os campos que você mostrou no seu JSON anterior
        const novoProduto = await sql`
            INSERT INTO produtos (
                empresa_id, 
                nome, 
                preco, 
                estoque, 
                tipo,
                ativo
            ) VALUES (
                ${usuario.empresa_id}, 
                ${body.nome}, 
                ${body.preco}, 
                ${body.estoque || 0}, 
                ${body.tipo || 'produto'},
                true
            )
            RETURNING id
        `
        
        const produtoId = novoProduto[0].id

        return { 
            success: true, 
            id: produtoId, 
            message: "Produto criado com sucesso!" 
        }

    } catch (error: any) {
        // Isso vai mandar o erro exato do banco para o seu navegador
        throw createError({ 
            statusCode: 500, 
            message: `ERRO DE BANCO: ${error.message}` 
        })
    }
})