FROM node:18.16.0-alpine3.17 as build

WORKDIR /app

COPY . /app/

RUN yarn install && yarn build

FROM horizoncd/horizon-web-base:v1.0.0

COPY --from=build /app/dist /usr/share/nginx/html

USER horizon

CMD ["nginx", "-g", "daemon off;"]
