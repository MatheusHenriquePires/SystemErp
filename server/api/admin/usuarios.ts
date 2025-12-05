import sql from '~/server/database'
import { defineEventHandler, getCookie, createError, readBody } from 'h3'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    // 1. Segurança
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })
    
    const payload = jwt.decode(cookie) as { id: number, empresa_id: number }
    const method = event.node.req.method

    // --- GET: Listar Usuários ---
    if (method === 'GET') {
        try {
            // 👇 CORREÇÃO AQUI: Trocamos 'cargo' por 'role'
            const usuarios = await sql`
                SELECT id, nome, email, role 
                FROM usuarios 
                WHERE empresa_id = ${payload.empresa_id}
                ORDER BY id ASC
            `
            return usuarios
        } catch (error) {
            console.error('Erro ao listar usuários:', error)
            return [] // Se der erro, retorna vazio (era isso que estava acontecendo)
        }
    }

    // --- POST: Criar Novo Usuário ---
    if (method === 'POST') {
        const body = await readBody(event)

        if (!body.nome || !body.email || !body.senha) {
            throw createError({ statusCode: 400, message: 'Preencha todos os campos.' })
        }

        try {
            const salt = await bcrypt.genSalt(10)
            const senhaHash = await bcrypt.hash(body.senha, salt)

            // 👇 CORREÇÃO AQUI: Insert na coluna 'role'
            await sql`
                INSERT INTO usuarios (empresa_id, nome, email, senha, role)
                VALUES (${payload.empresa_id}, ${body.nome}, ${body.email}, ${senhaHash}, ${body.role || 'vendedor'})
            `
            return { success: true, message: 'Usuário criado com sucesso!' }

        } catch (error: any) {
            if (error.code === '23505') {
                throw createError({ statusCode: 409, message: 'Este e-mail já está cadastrado.' })
            }
            console.error(error)
            throw createError({ statusCode: 500, message: 'Erro ao criar usuário.' })
        }
    }
})