FROM ubuntu:16.04

RUN apt-get update && apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get -y install nodejs

WORKDIR app

COPY package.json .

RUN npm i

COPY webpack.config.js .
COPY dist ./dist
COPY src ./src

nop

EXPOSE 9000

CMD ["npm", "run", "serve"]
