FROM node:20-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/. .

COPY shared ./shared

EXPOSE 3000
CMD ["npm", "run", "dev"]