FROM node:10

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

ARG SCRIPT="start"
ENV SCRIPT=${SCRIPT}
ENTRYPOINT ["sh", "run.sh"]
