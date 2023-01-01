FROM node:18.12-bullseye

WORKDIR /home/app

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY pnpm-lock.yaml ./
RUN pnpm fetch

ADD . ./

RUN pnpm install -r --offline

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE ${PORT}

CMD [ "node", "dist/index.js" ]
