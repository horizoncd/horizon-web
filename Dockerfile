FROM node:14.21-alpine as build

WORKDIR /app

COPY . /app/

RUN yarn && yarn build

FROM horizoncd/horizon-web-base:v1.0.0

COPY --from=build /app/dist /usr/share/nginx/html

USER horizon

CMD ["nginx", "-g", "daemon off;"]
