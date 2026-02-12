# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.23-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o octomus-local ./cmd/server/main.go

# Stage 3: Runtime
FROM alpine:latest

# Install Node.js and NPM for running npx-based MCP servers
RUN apk add --no-cache nodejs npm ca-certificates

WORKDIR /app

# Copy binary
COPY --from=backend-builder /app/octomus-local .

# Copy frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 8080

# Run
CMD ["./octomus-local"]
