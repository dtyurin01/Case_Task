FROM node:20

WORKDIR /usr/src/app
COPY backend/package*.json ./
RUN npm install

COPY backend/prisma ./prisma
RUN npx prisma generate

COPY backend/. .

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "dev"]
