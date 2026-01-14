From node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY ./dist ./dist

EXPOSE 8080
CMD ["npm", "run", "start"]