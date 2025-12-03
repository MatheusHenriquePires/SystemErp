import postgres from 'postgres'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Validação de Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })
    
    try {
        jwt.verify(cookie, EXPLICIT_SECRET);
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    // 2. Pega o ID da URL
    const id = event.context.params?.id
    if (!id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

    try {
        // 3. Busca o Pedido + Dados do Cliente
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

        // 4. (Opcional) Busca os Itens do Pedido
        // Se você ainda não criou a tabela 'pedidos_itens', isso retornará vazio por enquanto.
        // const itens = await sql`SELECT * FROM pedidos_itens WHERE pedido_id = ${id}`
        const itens: any[] = [] // Deixe vazio por enquanto se não tiver a tabela

        return { ...pedido[0], itens }

    } catch (error) {
        console.error(error)
        throw createError({ statusCode: 500, message: 'Erro ao buscar pedido' })
    }
})