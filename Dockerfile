FROM node:16.13.1-bullseye

WORKDIR /home/app

COPY . .

RUN npm install \
    && npm run build \
    && rm -rf node_modules \
    && npm install --production

ENV NODE_ENV=production

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
