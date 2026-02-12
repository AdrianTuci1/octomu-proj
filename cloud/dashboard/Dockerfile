FROM node:18-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Expose Vite port
EXPOSE 5173

# Start in dev mode (host=0.0.0.0 is needed for docker)
CMD ["npm", "run", "dev", "--", "--host"]
