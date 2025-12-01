# 1. Usa a versão 20 do Node (Mais moderna e compatível)
FROM node:20-alpine

# 2. Define a pasta de trabalho
WORKDIR /app

# 3. Copia os arquivos de configuração
COPY package*.json ./

# 4. Instala as dependências ignorando scripts opcionais que podem falhar
RUN npm install --ignore-scripts

# 5. Copia o resto do código
COPY . .

# ... (Até a Linha 15, que é "COPY . .") ...

# 6. Prepara o projeto (Gera os arquivos de configuração do Nuxt)
# Fazemos isso ANTES de instalar e construir.
RUN npx nuxi prepare

# 7. Constrói o projeto
# O 'build' precisa dos arquivos gerados pelo 'prepare'
RUN npm run build 

# 8. Expõe a porta
EXPOSE 3000

# 9. Configurações de ambiente
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 10. Inicia o servidor
CMD ["node", ".output/server/index.mjs"]