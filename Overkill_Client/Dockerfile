FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

COPY docker/entrypoint.sh /usr/local/bin/overkill-frontend-entrypoint
RUN chmod +x /usr/local/bin/overkill-frontend-entrypoint

EXPOSE 5173

ENTRYPOINT ["overkill-frontend-entrypoint"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
