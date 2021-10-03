# => Build stage.
FROM node:14.17.4-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY .eslintrc.json ./
COPY global.d.ts ./

RUN npm install

COPY ./src ./src

RUN npm run build

# => Serve stage.
FROM node:14.17.4-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

ENV TZ Asia/Tehran
# RUN echo "Asia/Tehran" > /etc/timezone
# RUN dpkg-reconfigure -f noninteractive tzdata

CMD npm start