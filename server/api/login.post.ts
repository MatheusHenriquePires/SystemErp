// server/api/login.post.ts (REVERTIDO PARA VERIFICAÇÃO SIMPLES)
import sql from '~/server/database' 
import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' 

// Variável de segredo (mantida para JWT)
const EXPLICIT_SECRET = 'minha_chave_secreta_super_segura_12345'; 

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, senha } = body // Senha em texto plano

    try {
        // 1. AUTENTICAÇÃO SIMPLES (SQL)
        const usuarios = await sql`
            SELECT id, empresa_id, nome FROM usuarios 
            WHERE email = ${email} 
            AND senha = ${senha} -- <-- VOLTA AO SEU MÉTODO ORIGINAL
        `
        
        if (usuarios.length === 0) {
            // Se o bcrypt estava ativado e as senhas eram hash, esta é a linha que falhava.
            throw createError({ statusCode: 401, message: 'Email ou senha inválidos' })
        }

        const usuario = usuarios[0]
        
        // 2. CRIAR O TOKEN JWT (Continua correto)
        const payload = { id: usuario.id, empresa_id: usuario.empresa_id }
        
        const token = jwt.sign(payload, EXPLICIT_SECRET, { 
            expiresIn: '2h' 
        })

        // 3. Define o cookie de sessão com o TOKEN JWT
       setCookie(event, 'usuario_sessao', token, {
    httpOnly: false, // <<--- CORREÇÃO TEMPORÁRIA: Permite que o JS do cliente leia o cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2 // 2 horas (em segundos)
});

        return { sucesso: true, usuario }

    } catch (erro) {
        if (erro.statusCode === 401) {
             throw erro;
        }
        console.error('🔥 ERRO CRÍTICO NO LOGIN:', erro)
        // Lança o 500 se o servidor travar por outro motivo
        throw createError({ statusCode: 500, message: 'Erro interno no servidor' })
    }
})