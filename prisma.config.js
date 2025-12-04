// prisma.config.js (Versão Final Simples)

module.exports = {
  datasources: {
    db: {
      provider: 'postgresql',
      // O CLI do Prisma lerá o DATABASE_URL do seu .env
      url: process.env.DATABASE_URL, 
    },
  },
}