// server/api/pedidos.post.ts
// ... imports ...

// USE A MESMA CHAVE!
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42'; 

export default defineEventHandler(async (event) => {
    // ... código de autenticação ...

    let payload;
    try {
        // AQUI: Usa a chave explícita para verificar
        payload = jwt.verify(cookie, EXPLICIT_SECRET) as { empresa_id: number }; // <-- MUDANÇA AQUI
    } catch (e) {
        // ... (resto do catch para 403) ...
        console.error("ERRO 403: Falha na validação do JWT (Expired/Invalid Signature).", e);
        throw createError({ statusCode: 403, message: 'Sessão inválida ou expirada. Faça login novamente.' });
    }
    
    // ... restante da lógica de transação SQL ...
})