# Stage 1: 프론트엔드 빌드
FROM node:20-alpine AS frontend
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Python 서버 + 정적 파일
FROM python:3.12-slim
WORKDIR /app

# py 서버 의존성
COPY py/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 빌드된 프론트 + 서버 스크립트
COPY py/server.py ./
COPY --from=frontend /app/dist ./dist

# 기본 포트 (docker-compose 등에서 오버라이드 가능)
ENV PORT=80
ENV SERVE_STATIC=1

EXPOSE 80

CMD ["python", "server.py"]
