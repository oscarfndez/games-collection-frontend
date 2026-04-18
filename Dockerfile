# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/gamescollection
COPY --from=build /app/dist/game-collection-frontend/browser/ /usr/share/nginx/html/gamescollection/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]