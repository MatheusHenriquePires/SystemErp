import jwt from 'jsonwebtoken' // <--- Importante
import postgres from 'postgres'
import { defineEventHandler, readBody, setCookie, createError } from 'h3'

const sql = postgres(process.env.DATABASE_URL as string)

// ESTA É A CHAVE MESTRA. 
// Dica: No mundo real, coloque isso no .env (ex: process.env.JWT_SECRET)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42'; 

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // 1. Verifica usuário no banco (Exemplo simplificado)
    const usuarios = await sql`
        SELECT * FROM usuarios WHERE email = ${body.email} AND senha = ${body.senha}
    `
    const usuario = usuarios[0]

    if (!usuario) {
        throw createError({ statusCode: 401, message: 'Email ou senha incorretos' })
    }

    // 2. CRIA O TOKEN (ASSINATURA)
    // Aqui garantimos que o token é gerado com a NOSSA chave secreta
    const token = jwt.sign(
        { 
            id: usuario.id, 
            email: usuario.email, 
            empresa_id: usuario.empresa_id // Dados que você quer ler depois
        }, 
        EXPLICIT_SECRET, 
        { expiresIn: '7d' } // Validade
    );

    // 3. Salva no Cookie
    setCookie(event, 'usuario_sessao', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    return { success: true, user: usuario }
})