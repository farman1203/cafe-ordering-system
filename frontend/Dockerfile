# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Vite bakes these into the bundle at BUILD time
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_QR_MENU_URL=http://localhost:5173/menu?source=qr
ENV VITE_API_URL=$VITE_API_URL VITE_QR_MENU_URL=$VITE_QR_MENU_URL
RUN npm run build

# ---- serve stage ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
