# ETAPA 1: Compilación de Ionic/Angular con Node.js
FROM node:20-alpine AS build
WORKDIR /app
# Copiamos las dependencias y las instalamos
COPY package*.json ./
RUN npm install
# Copiamos el resto del código y construimos la versión de producción
COPY . .
RUN npm run build --prod

# ETAPA 2: Servidor Nginx ultra-rápido para servir la web
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos la carpeta 'www' (donde Ionic escupe el código compilado) a Nginx
COPY --from=build /app/www /usr/share/nginx/html
# (Nota: Si tu Angular escupe en 'dist/tu-proyecto', cambia /app/www por esa ruta)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]