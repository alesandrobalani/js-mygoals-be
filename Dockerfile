FROM node:18-alpine
WORKDIR /app

# Production dependencies first
COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
