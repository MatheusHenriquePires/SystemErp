# -----------------------
# BUILD STAGE
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

# 🚨 CORREÇÃO CRÍTICA: Instala as ferramentas de build e libs de imagem ANTES do npm install
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    # Libs necessárias para a biblioteca 'canvas' no Alpine:
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    libtool \
    autoconf \
    automake

# Instala todas as deps incluindo dev
COPY package*.json ./

# Este comando AGORA deve encontrar o Python e as libs de imagem para compilar o 'canvas'
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

# Instala libs de runtime que são essenciais para o 'canvas' no Alpine (não são de build)
# Se o 'canvas' compilar corretamente na BUILD STAGE, ele pode precisar dessas libs aqui.
RUN apk add --no-cache libc6-compat \
    cairo \
    pango \
    jpeg \
    giflib \
    # Dependências de runtime do Python (se o binário precisar)
    python3

# Copia artefatos do build
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# 🔥 DESATIVA scripts de lifecycle (para evitar rodar "nuxt prepare")
ENV NPM_CONFIG_IGNORE_SCRIPTS=true

# Instala apenas prod
# O 'canvas' será instalado aqui, mas agora deve usar os binários pré-compilados na fase anterior.
RUN npm install --omit=dev

# Variáveis padrão do Nitro
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000

# Remove o comando desnecessário (já movido para a BUILD STAGE)
# REMOVIDO: RUN apk add --no-cache python3 make g++

# Inicia o server Nitro
CMD ["node", ".output/server/index.mjs"]