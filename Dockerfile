FROM node:16.13.1
WORKDIR /app
COPY . ./
RUN npm install
EXPOSE 8443
CMD ["node", "index.js"]