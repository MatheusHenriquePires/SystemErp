# 1. Node Alpine (leve e compatível com Nuxt 3)
FROM node:20-alpine

# 2. Dependências necessárias para o Tailwind/PostCSS/Vite
RUN apk add --no-cache libc6-compat

# 3. Pasta de trabalho
WORKDIR /app

# 4. Copia apenas arquivos de dependências (cache otimizado)
COPY package*.json ./

# 5. Instala dependências normalmente (sem ignore-scripts)
RUN npm install

# 6. Copia o restante do código
COPY . .

# 7. Prepara o Nuxt (gera .nuxt, types, etc)
RUN npx nuxi prepare

# 8. Build da aplicação (gera .output)
RUN npm run build

# 9. Expõe porta
EXPOSE 3000

# 10. Define ambiente do Nitro
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

# 11. Inicia o servidor otimizado do Nuxt
CMD ["node", ".output/server/index.mjs"]
