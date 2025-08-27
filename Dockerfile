# 使用官方 Node.js 18 Alpine 映像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 安裝系統依賴 (如果需要)
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# 複製 package files
COPY package*.json ./

# 安裝 npm 依賴
RUN npm ci --only=production && npm cache clean --force

# 建立非 root 使用者
RUN addgroup -g 1001 -S nodejs && \
    adduser -S crm -u 1001 -G nodejs

# 複製應用程式碼
COPY --chown=crm:nodejs . .

# 切換到非 root 使用者
USER crm

# 暴露 port
EXPOSE 3000

# 設置健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# 使用 dumb-init 作為 PID 1，優雅處理信號
ENTRYPOINT ["dumb-init", "--"]

# 啟動命令
CMD ["npm", "start"]