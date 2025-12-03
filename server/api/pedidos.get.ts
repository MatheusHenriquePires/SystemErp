import postgres from 'postgres'
import { defineEventHandler, getCookie, getQuery, createError } from 'h3'
import jwt from 'jsonwebtoken'

const sql = postgres(process.env.DATABASE_URL as string)
const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42';

export default defineEventHandler(async (event) => {
    // 1. Autenticação
    const cookie = getCookie(event, 'usuario_sessao')
    if (!cookie) throw createError({ statusCode: 401, message: 'Não autorizado' })

    let usuario;
    try {
        usuario = jwt.verify(cookie, EXPLICIT_SECRET) as { empresa_id: number };
    } catch (e) {
        throw createError({ statusCode: 403, message: 'Sessão inválida' })
    }

    // 2. Ler Filtros da URL (ex: ?status=ORCAMENTO)
    const query = getQuery(event)
    const statusFiltro = query.status as string;

    try {
        // 3. Montar a Query Dinâmica
        // Usamos um array para construir as condições WHERE
        let condicoes = sql`WHERE p.empresa_id = ${usuario.empresa_id}`

        // Se o frontend mandou um status específico (e não é 'TODOS')
        if (statusFiltro && statusFiltro !== 'TODOS') {
            condicoes = sql`${condicoes} AND p.status = ${statusFiltro}`
        }

        // 4. Executa a busca (Fazendo JOIN para pegar o nome do cliente)
        const pedidos = await sql`
            SELECT 
                p.id,
                p.data_criacao,
                p.status,
                p.total,
                c.nome as cliente_nome,
                c.email as cliente_email
            FROM pedidos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            ${condicoes}
            ORDER BY p.id DESC
        `

        return pedidos

    } catch (error) {
        console.error("Erro ao listar pedidos:", error)
        return []
    }
})