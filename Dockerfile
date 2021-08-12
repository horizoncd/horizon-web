# https://github.com/nginxinc/docker-nginx/blob/f958fbacada447737319e979db45a1da49123142/mainline/debian/Dockerfile
FROM nginx:1.21.1
COPY dist /usr/share/nginx/html
