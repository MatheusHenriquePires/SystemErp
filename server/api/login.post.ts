// server/api/login.post.ts
// ... imports ...

const sql = postgres(process.env.DATABASE_URL as string)
// DEFINIÇÃO: Use uma chave forte e a defina explicitamente.
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42'; 

export default defineEventHandler(async (event) => {
    // ... [código de leitura de email/senha] ...

    // ... [código de busca e autenticação no banco] ...

    // ... [código de definição do payload] ...

    // 2. CRIAR O TOKEN JWT (USANDO A CHAVE DEFINIDA)
    const token = jwt.sign(payload, EXPLICIT_SECRET, { // <-- MUDANÇA AQUI
        expiresIn: '2h' 
    })

    // 3. Define o cookie de sessão com o TOKEN JWT
    setCookie(event, 'usuario_sessao', token, {
        httpOnly: true, // Impedir acesso via JS (segurança)
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',
        path: '/', 
        maxAge: 60 * 60 * 2 // 2 horas (em segundos)
    })

    return { sucesso: true, usuario }

    // ... [catch block] ...
})