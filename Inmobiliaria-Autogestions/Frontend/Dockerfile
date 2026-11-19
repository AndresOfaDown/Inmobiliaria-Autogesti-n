# Etapa 1: Compilación de React Vite
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Usar /api para que las llamadas pasen por el proxy de Nginx
ENV VITE_API_URL=/api

RUN npm run build

# Etapa 2: Servidor Nginx de producción
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
