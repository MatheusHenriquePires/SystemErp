// prisma.config.ts (Versão Limpa Final)

// Removida a linha 'import { defineConfig } from...' para evitar o erro de módulo.

// O CLI do Prisma deve ser capaz de inferir a estrutura da configuração
export default {
  datasources: {
    db: {
      provider: 'postgresql',
      // Lendo a variável de ambiente que está no seu .env
      url: process.env.DATABASE_URL, 
    },
  },
}