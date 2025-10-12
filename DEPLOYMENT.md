
# Deployment Guide

## 1. Prerequisites
- Docker image published via CI to Docker Hub.
- Environment variables set (see .env.example).
- Database (managed Postgres or container).

## 2. Render
1. Create new Web Service -> Deploy from GitHub repo.
2. Runtime: Docker.
3. Provide DOCKER_COMMAND (e.g., `node server.js`).
4. Add environment variables (copy from .env).
5. For Postgres: add Render Postgres; update DATABASE_URL.

## 3. Railway
1. Create project -> Deploy from repo.
2. Add Postgres plugin -> copy generated URL into variables.
3. Set service variables (remove quotes).
4. Set start command: `node server.js` (or `node dist/index.js`).

## 4. Vercel (API-only note)
Vercel is better suited for serverless functions; if full Express app, prefer Render/Railway.

## 5. AWS (ECS Fargate quick outline)
- Push image to ECR (replace Docker Hub flow if needed).
- Create Task Definition (container port 3000).
- Create Service + ALB listener :80 -> target group.
- Store secrets in SSM Parameter Store or Secrets Manager.

## 6. Migrations
Add to container startup (already example in docker-compose):
`npx prisma migrate deploy` or your ORM equivalent.

## 7. Health Check
Implement /health endpoint and configure platform health checks.

## 8. Monitoring
- Enable logs (platform default).
- Optionally add OpenTelemetry exporter later.