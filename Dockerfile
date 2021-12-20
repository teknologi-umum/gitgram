FROM node:16.13.1-bullseye

WORKDIR /home/app

COPY . .

RUN npm install

ENV NODE_ENV=production

RUN npm run build \
    && rm -rf node_modules \
    && npm install --production

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
