// server/api/vendas/index.ts
import sql from '~/server/database' // Corrigido para importar o default 'sql'
import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken' // Se precisar decodificar o cookie

export default defineEventHandler(async (event) => {
  // ...
  const db = sql // Simplificamos para usar o sql
  // ...
  // O restante do código usa 'db.query' e deve ser substituído por 'sql`...'
  
  // Vamos usar o 'sql` diretamente:
  const result = await sql`
      SELECT 
        v.id, 
        v.data_venda, 
        v.valor_total, 
        v.status, 
        c.nome AS cliente_nome
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE v.empresa_id = ${empresa_id}
      ORDER BY v.data_venda DESC
      `
      
    // Remova qualquer linha como "const db = new Database()" se existir.
    return result
});