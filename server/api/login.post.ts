// server/api/login.post.ts (CORRIGIDO PARA HASHING)
import sql from '~/server/database' 
import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' 
import bcrypt from 'bcryptjs' // <--- AGORA ESTÁ SENDO USADO

// Sua chave secreta
const EXPLICIT_SECRET = 'sua_chave_secreta_super_segura_12345'; 

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, senha } = body // 'senha' é a senha em texto plano do usuário

    try {
        // 1. Buscar o usuário APENAS PELO EMAIL
        const [usuario] = await sql`
            SELECT id, empresa_id, nome, password_hash FROM usuarios 
            WHERE email = ${email} 
        `
        
        // Se não achou o usuário
        if (!usuario) {
            throw createError({ statusCode: 401, message: 'Email ou senha inválidos' })
        }
        
        // 2. COMPARAR o hash do banco (password_hash) com a senha de texto plano
        // ATENÇÃO: Se sua coluna de senha se chama 'senha' e não 'password_hash', você precisa ajustar o nome da coluna no SELECT e na comparação.
        const isPasswordValid = await bcrypt.compare(senha, usuario.password_hash) 

        if (!isPasswordValid) {
            throw createError({ statusCode: 401, message: 'Email ou senha inválidos' })
        }

        // 3. Se passou (autenticado), CRIAR O TOKEN JWT
        const payload = { id: usuario.id, empresa_id: usuario.empresa_id }
        
        const token = jwt.sign(payload, EXPLICIT_SECRET, { expiresIn: '2h' })

        // 4. Define o cookie de sessão com o TOKEN JWT
        setCookie(event, 'usuario_sessao', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 2
        })

        return { sucesso: true, usuario }

    } catch (erro) {
        if (erro.statusCode === 401) {
             throw erro;
        }
        console.error('🔥 ERRO CRÍTICO NO LOGIN:', erro)
        throw createError({ statusCode: 500, message: 'Erro interno no servidor' })
    }
})