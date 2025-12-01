# 1. Usa a imagem Node 20 (compatível com Nuxt 3)
FROM node:20-alpine

# 2. Define a pasta de trabalho
WORKDIR /app

# 3. Copia os arquivos de dependências
COPY package*.json ./

# 4. Instala as dependências, ignorando scripts opcionais
RUN npm install --ignore-scripts

# 5. Copia o código fonte para dentro do container
COPY . .


# 6. Constrói e prepara o projeto
RUN npm install # Já foi rodado na linha 4

# 7. Constrói o projeto
RUN npm run build 
# ...
# 7. Expõe a porta
EXPOSE 3000

# 8. Configurações de ambiente
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 9. Comando de Iniciação
CMD ["node", ".output/server/index.mjs"]