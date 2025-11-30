# 1. Usa uma imagem leve do Node.js
FROM node:18-alpine

# 2. Cria a pasta do app dentro do servidor
WORKDIR /app

# 3. Copia os arquivos de configuração primeiro (para aproveitar cache)
COPY package*.json ./

# 4. Instala as dependências
RUN npm install

# 5. Copia todo o resto do código
COPY . .

# 6. Constrói o projeto (Transforma Vue em HTML/JS otimizado)
RUN npm run build

# 7. Expõe a porta 3000 (Padrão do Nuxt no servidor)
EXPOSE 3000

# 8. Define as variáveis de ambiente padrão (Segurança)
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 9. Comando para iniciar o site
CMD ["node", ".output/server/index.mjs"]