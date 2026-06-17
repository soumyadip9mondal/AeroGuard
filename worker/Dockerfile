FROM node:20-slim

# Install system dependencies and FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

# Install packages
RUN npm ci

COPY . .

# Compile TypeScript
RUN npm run build

CMD ["npm", "start"]
