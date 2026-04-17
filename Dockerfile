# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa runtime
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/game-collection-frontend/browser /usr/share/nginx/html
# Si tu build deja los ficheros en /app/dist/game-collection-frontend en vez de /browser,
# cambia la línea anterior por:
# COPY --from=build /app/dist/game-collection-frontend /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]