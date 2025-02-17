# 🐳 Node.js Tetris Game Dockerfile
FROM node:18.19.1-slim

# 📁 Create app directory
WORKDIR /usr/src/app

# 📦 Install app dependencies
COPY package*.json ./
RUN npm install

# 📝 Bundle app source
COPY . .

# 🔨 Build client bundle
RUN npm run build:client

# 🚪 Expose port
EXPOSE 3000

# 🎮 Start game server
CMD [ "npm", "start" ]
