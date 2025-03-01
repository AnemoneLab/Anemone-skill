FROM node:18-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 全局安装tsx
RUN npm install -g tsx

# 复制源代码
COPY . .

# 暴露应用端口
EXPOSE 3456

# 使用tsx直接运行TypeScript文件
CMD ["tsx", "local_server.ts"] 