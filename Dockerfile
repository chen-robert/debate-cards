FROM node:16-slim

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

CMD ["node", "app.js"]
