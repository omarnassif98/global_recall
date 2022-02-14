FROM node:10
COPY . /app
WORKDIR /app
EXPOSE 80
RUN npm ci --only=production && npm cache clean --force
CMD [ "node", "index.js"]