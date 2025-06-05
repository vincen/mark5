# 1. Building phrase
# User the official Node.js image as the base image
FROM node:22.16-alpine3.22 AS builder
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Update npm to the latest version
RUN npm install -g npm@latest
# Install the dependencies
RUN npm ci
# Copy the rest of the application code to the working directory
COPY . .
# Generate the Prisma client (this will write the Prisma client to node_modules/.prisma and node_modules/@prisma/client)
RUN npx prisma generate
# Build the application
RUN npm run build

# 2. Running phrase
# Use the official Node.js image as the base image for running the application
FROM node:22.16-alpine3.22 AS runner
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production
# Copy the built application from the build stage
COPY --from=builder /app/dist ./dist
# Copy the Prisma schema and client from the build stage
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
# Copy the environment variables file
COPY --from=builder /app/.env ./

# Expose the port the app runs on
EXPOSE 3000
# Start the application
CMD ["npm", "run", "start"]