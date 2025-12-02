# -----------------------
# BUILD STAGE
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Instala todas as deps incluindo dev
COPY package*.json ./
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

# Instala dependências de sistema para lidar com arquivos
RUN apk add --no-cache python3 make g++

# Inicia o server Nitro
CMD ["node", ".output/server/index.mjs"]
