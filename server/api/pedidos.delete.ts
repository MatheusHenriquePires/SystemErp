import postgres from 'postgres'
import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Segurança Básica
    const token = getCookie(event, 'usuario_sessao')
    if (!token) throw createError({ statusCode: 401, message: 'Login necessário' })

    const body = await readBody(event)
    if (!body.id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

    console.log(`[DELETE] Tentando excluir pedido #${body.id}...`);

    try {
        // 2. Tenta apagar FINANCEIRO (Se a tabela existir)
        try {
            await sql`DELETE FROM financeiro WHERE pedido_id = ${body.id}`
        } catch (e) {
            console.warn("Aviso: Não foi possível apagar financeiro (talvez tabela não exista).", e);
        }

        // 3. Tenta apagar ITENS (Tenta os dois nomes comuns para garantir)
        try {
            // Tenta nome 1
            await sql`DELETE FROM pedidos_itens WHERE pedido_id = ${body.id}`
        } catch (e) {
            // Se falhar, tenta nome 2
            try {
                await sql`DELETE FROM itens_pedido WHERE pedido_id = ${body.id}`
            } catch (e2) {
                console.warn("Aviso: Erro ao apagar itens do pedido.", e2);
            }
        }
        
        // 4. Finalmente, apaga o PEDIDO PRINCIPAL
        await sql`DELETE FROM pedidos WHERE id = ${body.id}`

        console.log(`[DELETE] Pedido #${body.id} excluído com sucesso.`);
        return { success: true, message: 'Pedido excluído com sucesso.' }

    } catch (error: any) {
        // Esse log vai aparecer no seu terminal do VS Code, te ajudando a ver o erro real
        console.error('ERRO CRÍTICO AO EXCLUIR:', error)
        
        throw createError({ 
            statusCode: 500, 
            message: `Erro ao excluir: ${error.message}` 
        })
    }
})