FROM harbor.yf-online.service.163.org/cloudnative/library/horizon-web-base:v1.0.0
COPY dist /usr/share/nginx/html
USER horizon
CMD ["nginx", "-g", "daemon off;"]