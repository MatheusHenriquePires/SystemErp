import jwt from 'jsonwebtoken'
import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42'; 

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Faça login' })

    let usuario;
    try {
        usuario = jwt.verify(cookie, EXPLICIT_SECRET) as { empresa_id: number };
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    if (!body.cliente_id) throw createError({ statusCode: 400, message: 'Cliente obrigatório' })

    try {
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
        return { success: true, id: resultado[0].id }

    } catch (error: any) {
        console.error("Erro SQL:", error)
        throw createError({ statusCode: 500, message: `Erro no Banco: ${error.message}` })
    }
})