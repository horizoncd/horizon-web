# https://github.com/nginxinc/docker-nginx/blob/f958fbacada447737319e979db45a1da49123142/mainline/debian/Dockerfile
FROM harbor.yf-online.service.163.org/library/nginx
COPY dist /usr/share/nginx/html
