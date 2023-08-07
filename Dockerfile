FROM node:16.13.1
WORKDIR /app
COPY . ./
RUN npm install
EXPOSE 3000
CMD ["echo", "initiating service"]
