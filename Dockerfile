FROM node:lts-alpine

WORKDIR /app

# Copy only the necessary files
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .  

# Expose the application port
EXPOSE 3000

# Run in development mode
CMD ["npm", "run", "start:dev"]
