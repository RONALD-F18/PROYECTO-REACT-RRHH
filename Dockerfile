FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
# Cliente HTTP del front (src/services/api.js); refuerzo explícito por si el lock cambia en el host
RUN npm install axios@^1.13.6 --no-audit --no-fund

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
