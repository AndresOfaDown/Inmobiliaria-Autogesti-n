FROM node:20-alpine

WORKDIR /app

# Instalar dependencias necesarias para compilar paquetes nativos si hiciera falta
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && (node dist/src/main || node dist/main)"]
