# 1. Usa a versão 20 do Node (Mais moderna e estável para Nuxt 3)
FROM node:20-alpine

# 2. Define a pasta de trabalho
WORKDIR /app

# 3. Copia os arquivos de configuração
COPY package*.json ./

# 4. Instala as dependências ignorando scripts opcionais (para evitar falhas)
RUN npm install --ignore-scripts

# 5. Copia todo o resto do código
COPY . .

# 6. Constrói e gera os tipos em um comando só (Resolve o erro de timing)
RUN npx nuxi prepare
RUN npm run build
# 7. Expõe a porta
EXPOSE 3000

# 8. Configurações de ambiente
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 9. Inicia o servidor
CMD ["node", ".output/server/index.mjs"]x