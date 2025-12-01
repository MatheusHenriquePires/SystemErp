# 1. Usa a imagem Node 20 (compatível com Nuxt 3)
FROM node:20-alpine

# 2. Define a pasta de trabalho
WORKDIR /app

# 3. Copia os arquivos de dependências
COPY package*.json ./

# 4. Instala as dependências (Cached layer)
RUN npm install --ignore-scripts

# 5. Copia todo o resto do código
COPY . .

# 6. Expõe a porta
EXPOSE 3000

# 7. Configurações de ambiente
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 8. Comando de Iniciação (Resolve o erro de timing forçando o build e o start)
# O build acontece na hora de iniciar o container.
CMD ["sh", "-c", "npm run build && node .output/server/index.mjs"]