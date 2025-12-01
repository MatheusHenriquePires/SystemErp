# 1. Usa a imagem Node 20 (compatível com Nuxt 3)
FROM node:20-alpine

# 2. Define a pasta de trabalho
WORKDIR /app

# 3. Copia os arquivos de dependências
COPY package*.json ./

# 4. Instala as dependências
RUN npm install --ignore-scripts

# 5. Copia o código fonte
COPY . .

# 6. Gera arquivos internos do Nuxt (inclui tsconfig.app.json)
RUN npx nuxi prepare

# 7. Build da aplicação
RUN npm run build

# 8. Expõe a porta
EXPOSE 3000

# 9. Variáveis obrigatórias
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 10. Start da API final
CMD ["node", ".output/server/index.mjs"]
