# /server/Dockerfile

FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for TypeScript)
RUN npm install

# Copy source code (Note: This excludes real .env files due to .dockerignore)
COPY . .

# Create a dummy config.env so 'npm run copy-assets' doesn't crash.
# Docker Compose will inject the REAL values, so this file can be empty.
RUN mkdir -p src/config && touch src/config/config.env

# Build the application (Runs tsc + copy-assets)
RUN npm run build

# Expose port
EXPOSE 8000

# Start the server using the compiled code
CMD ["npm", "start"]