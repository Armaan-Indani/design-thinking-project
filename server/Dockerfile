FROM node:18-slim

WORKDIR /app

COPY package*.json ./

# Install build dependencies for native modules (sqlite3)
# Debian-based images use apt-get instead of apk
RUN apt-get update && apt-get install -y python3 make g++ build-essential

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
