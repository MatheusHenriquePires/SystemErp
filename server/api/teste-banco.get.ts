import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL as string)
export default defineEventHandler(async () => {
  try {
    const user = await sql`SELECT * FROM usuarios`
    return { status: 'SUCESSO', dados: user }
  } catch (e) {
    return { status: 'ERRO', motivo: String(e) }
  }
})