import jwt from 'jsonwebtoken'
import postgres from 'postgres'
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

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
    const body = await readBody(event)
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Login necessário' })

    const usuario = lerToken(cookie)
    if (!usuario || !usuario.empresa_id) {
        throw createError({ statusCode: 403, message: 'Sessão inválida.' })
    }

    if (!body.cliente_id) throw createError({ statusCode: 400, message: 'Cliente obrigatório' })

    try {
        // 1. Inserir o Pedido (Cabeçalho)
        const resultado = await sql`
            INSERT INTO pedidos (
                empresa_id, cliente_id, data_criacao, status, total
            ) VALUES (
                ${usuario.empresa_id}, ${body.cliente_id}, NOW(), 
                ${body.status || 'ORCAMENTO'}, 
                ${body.total || 0}
            )
            RETURNING id
        `
        const pedidoId = resultado[0].id

        // 2. Inserir os Itens, Lendo a nova estrutura de Cômodos
        if (body.comodos && body.comodos.length > 0) {
            for (const comodo of body.comodos) {
                // Para cada item dentro do cômodo...
                for (const item of comodo.produtos) {
                    await sql`
                        INSERT INTO pedidos_itens (
                            pedido_id, descricao, quantidade, preco_unitario, comodo -- NOVA COLUNA
                        ) VALUES (
                            ${pedidoId}, 
                            ${item.descricao || 'Item sem nome'}, 
                            ${item.quantidade || 1}, 
                            ${item.preco_unitario || 0},
                            ${comodo.comodo} -- O NOME DO CÔMODO
                        )
                    `
                }
            }
        }

        return { success: true, id: pedidoId }

    } catch (error: any) {
        console.error("Erro SQL:", error)
        throw createError({ statusCode: 500, message: `Erro no Banco: ${error.message}` })
    }
})