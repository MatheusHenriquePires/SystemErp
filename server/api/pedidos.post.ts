import jwt from 'jsonwebtoken'
import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42'; 

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    let usuario;
    try {
        usuario = jwt.verify(cookie, EXPLICIT_SECRET) as { empresa_id: number };
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    if (!body.cliente_id) throw createError({ statusCode: 400, message: 'Cliente obrigatório' })

    try {
        // 1. Inserir o Pedido (Cabeçalho)
        const resultado = await sql`
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
                ${body.status || 'ORCAMENTO'}, 
                ${body.total || 0}
            )
            RETURNING id
        `
        const pedidoId = resultado[0].id

        // 2. Inserir os Itens (Loop)
        if (body.items && body.items.length > 0) {
            for (const item of body.items) {
                await sql`
                    INSERT INTO pedidos_itens (
                        pedido_id,
                        descricao,
                        quantidade,
                        preco_unitario
                    ) VALUES (
                        ${pedidoId},
                        ${item.materialName || 'Item sem nome'},
                        ${item.quantity || 1},
                        ${item.unitPrice || 0}
                    )
                `
            }
        }

        return { success: true, id: pedidoId }

    } catch (error: any) {
        console.error("Erro SQL:", error)
        throw createError({ statusCode: 500, message: `Erro no Banco: ${error.message}` })
    }
})