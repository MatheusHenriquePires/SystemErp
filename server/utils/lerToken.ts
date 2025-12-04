import jwt from 'jsonwebtoken'

const EXPLICIT_SECRET = 'minha_chave_secreta_para_teste_2025_42'

export function lerToken(token: string) {
  try {
    return jwt.verify(token, EXPLICIT_SECRET)
  } catch (err) {
    console.error('JWT INVÁLIDO:', err)
    return null
  }
}
