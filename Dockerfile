# 1. Usa uma imagem leve do Node.js
FROM node:20-alpine

# 2. Cria a pasta do app dentro do servidor
WORKDIR /app

# 3. Copia os arquivos de dependências
COPY package*.json ./

# 4. Instala as dependências ignorando scripts opcionais (necessário para Nuxt)
RUN npm install --ignore-scripts

# 5. Copia todo o resto do código
COPY . .

# 6. Gera os arquivos de tipagem (tsconfig)
RUN npx nuxi prepare && npm run build

# 7. Expõe a porta
EXPOSE 3000

# 8. Configurações de ambiente
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 9. Comando de Iniciação
CMD ["node", ".output/server/index.mjs"]