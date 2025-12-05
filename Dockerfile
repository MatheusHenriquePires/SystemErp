# -----------------------
# BUILD STAGE
# -----------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Instala compatibilidade básica
RUN apk add --no-cache libc6-compat

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências (Agora sem Canvas, isso vai funcionar rápido!)
RUN npm install

# Copia o código
COPY . .

# Build do Nuxt
RUN npx nuxi prepare
RUN npm run build

# -----------------------
# PRODUCTION STAGE
# -----------------------
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copia o build final
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

ENV NPM_CONFIG_IGNORE_SCRIPTS=true

# Instala apenas dependências de produção
RUN npm install --omit=dev

ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]