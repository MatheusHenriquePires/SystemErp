import jwt from 'jsonwebtoken' // <--- Importante
import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

// A MESMA CHAVE DO LOGIN (Tem que ser idêntica!)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42'; 

export default defineEventHandler(async (event) => {
    // 1. Ler dados do pedido
    const body = await readBody(event)
    
    // 2. Ler Cookie
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Faça login' })

    let usuario;

    // 3. VERIFICAÇÃO SEGURA (A Mágica acontece aqui)
    try {
        // Se a chave for diferente ou o token for falso, isso explode um erro e cai no catch
        usuario = jwt.verify(cookie, EXPLICIT_SECRET) as { empresa_id: number, id: number };
    } catch (e) {
        console.error("Tentativa de invasão ou token expirado:", e)
        throw createError({ statusCode: 403, message: 'Sessão inválida. Faça login novamente.' })
    }

    // 4. Salvar no Banco
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
                'PENDENTE', 
                ${body.total || 0}
            )
            RETURNING id
        `
        return { success: true, id: resultado[0].id }
    } catch (error) {
        console.error("Erro SQL:", error)
        throw createError({ statusCode: 500, message: 'Erro ao salvar pedido' })
    }
})