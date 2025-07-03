FROM node:18-slim
WORKDIR /app
COPY . .
RUN npm ci --omit=dev
CMD ["npm", "start"]
