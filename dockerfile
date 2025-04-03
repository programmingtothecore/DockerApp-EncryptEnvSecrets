FROM node:20-alpine 

WORKDIR /app

COPY package.json .

RUN npm install

copy . .

CMD ["node","index.js"]