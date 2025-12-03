import postgres from 'postgres'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    try {
        jwt.verify(cookie, EXPLICIT_SECRET);
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    const id = event.context.params?.id
    if (!id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

    try {
        // 1. Busca dados do Pedido e Cliente
        const pedido = await sql`
            SELECT 
                p.*,
                c.nome as cliente_nome,
                c.email as cliente_email,
                c.telefone as cliente_telefone,
                c.cidade as cliente_cidade
            FROM pedidos p
            JOIN clientes c ON p.cliente_id = c.id
            WHERE p.id = ${id}
        `

        if (pedido.length === 0) throw createError({ statusCode: 404, message: 'Pedido não encontrado' })

        // 2. Busca os Itens do Pedido (NOVO)
        const itens = await sql`
            SELECT descricao, quantidade, preco_unitario 
            FROM pedidos_itens 
            WHERE pedido_id = ${id}
        `

        // Retorna tudo junto
        return { ...pedido[0], itens }

    } catch (error) {
        console.error(error)
        throw createError({ statusCode: 500, message: 'Erro ao buscar pedido' })
    }
})