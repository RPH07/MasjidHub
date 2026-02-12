FROM node:18-alpine

# Set folder kerja di dalam container
WORKDIR /app

# Copy package.json dulu biar caching layer Docker jalan optimal
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy sisa semua file source code
COPY . .

# Buka port 5000 (sesuai default backend lu)
EXPOSE 5000

# Jalanin server
CMD ["npm", "start"]