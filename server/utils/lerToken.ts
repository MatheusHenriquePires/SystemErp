import jwt from 'jsonwebtoken'

export function lerToken(token: string) {
  const payload: any = jwt.verify(token, process.env.JWT_SECRET as string)

  return {
    id: payload.id,
    empresa_id: payload.empresa_id, // ✅ OBRIGATÓRIO
    nome: payload.nome,
    email: payload.email
  }
}
