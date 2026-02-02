# Base stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Development stage
FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS prod
COPY . .
RUN npm run build
CMD ["npm", "start"]
