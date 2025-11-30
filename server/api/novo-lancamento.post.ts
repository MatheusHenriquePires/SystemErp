import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL as string)

export default defineEventHandler(async (event) => {
  // 1. SEGURANÇA: Verifica quem está logado
  const cookie = getCookie(event, 'usuario_sessao')
  if (!cookie) {
      throw createError({ statusCode: 401, message: 'Sessão expirada.' })
  }
  const usuario = JSON.parse(cookie)

  // 2. Processa os dados
  const body = await readBody(event)
  const { descricao, valor, tipo } = body

  let valorFinal = parseFloat(valor)
  if (tipo === 'despesa') {
    valorFinal = Math.abs(valorFinal) * -1
  } else {
    valorFinal = Math.abs(valorFinal)
  }

  // 3. Salva usando o ID da empresa do usuário
  await sql`
    INSERT INTO despesas (descricao, valor, categoria, empresa_id, data)
    VALUES (${descricao}, ${valorFinal}, 'Manual', ${usuario.empresa_id}, NOW())
  `

  return { sucesso: true }
})