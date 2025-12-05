import sql from '~/server/database'
import { defineEventHandler, getCookie, createError, readBody } from 'h3'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    // 1. Segurança: Verifica se está logado
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    
    const payload = jwt.decode(cookie) as { id: number, empresa_id: number, cargo?: string }
    const method = event.node.req.method

    // (Opcional) Bloqueio: Só permite se o usuário logado for 'admin'
    // if (payload.cargo !== 'admin') throw createError({ statusCode: 403, message: 'Acesso restrito a administradores.' })

    // --- GET: Listar Usuários ---
    if (method === 'GET') {
        try {
            // Trazemos tudo menos a senha
            const usuarios = await sql`
                SELECT id, nome, email, cargo, criado_em 
                FROM usuarios 
                WHERE empresa_id = ${payload.empresa_id}
                ORDER BY id DESC
            `
            return usuarios
        } catch (error) {
            return []
        }
    }

    // --- POST: Criar Novo Usuário ---
    if (method === 'POST') {
        const body = await readBody(event)

        if (!body.nome || !body.email || !body.senha) {
            throw createError({ statusCode: 400, message: 'Preencha todos os campos.' })
        }

        try {
            // 1. Criptografa a senha antes de salvar
            const salt = await bcrypt.genSalt(10)
            const senhaHash = await bcrypt.hash(body.senha, salt)

            // 2. Salva no banco
            await sql`
                INSERT INTO usuarios (empresa_id, nome, email, senha, cargo)
                VALUES (${payload.empresa_id}, ${body.nome}, ${body.email}, ${senhaHash}, ${body.cargo || 'vendedor'})
            `
            return { success: true, message: 'Usuário criado com sucesso!' }

        } catch (error: any) {
            // Erro de email duplicado (código 23505 do Postgres)
            if (error.code === '23505') {
                throw createError({ statusCode: 409, message: 'Este e-mail já está cadastrado.' })
            }
            throw createError({ statusCode: 500, message: 'Erro ao criar usuário.' })
        }
    }
})