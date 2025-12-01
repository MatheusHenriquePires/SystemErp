# ---- BASE ----
FROM node:20-alpine AS builder

# Dependências necessárias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copia dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código
COPY . .

# Gera .nuxt e types
RUN npx nuxi prepare

# Build final da aplicação
RUN npm run build


# ---- RUNNER (imagem final leve) ----
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copiar apenas o resultado final
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Apenas dependências necessárias para produção
RUN npm install --omit=dev

ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
