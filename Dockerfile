# -----------------------
# BUILD STAGE
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Instala todas as deps incluindo dev
COPY package*.json ./

# Limpamos o RUN npm install para evitar a compilação C++
RUN npm install 

# Copia resto do código
COPY . .

# Executa prepare e build
RUN npx nuxi prepare
RUN npm run build


# -----------------------
# PRODUCTION STAGE
# -----------------------
FROM node:20-alpine

WORKDIR /app

# Adiciona utilitários básicos de runtime (mantidos da sua versão original)
RUN apk add --no-cache libc6-compat

# Copia artefatos do build
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# 🔥 DESATIVA scripts de lifecycle (para evitar rodar "nuxt prepare")
ENV NPM_CONFIG_IGNORE_SCRIPTS=true

# Instala apenas prod
RUN npm install --omit=dev

# Variáveis padrão do Nitro
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000

# Inicia o server Nitro
CMD ["node", ".output/server/index.mjs"]