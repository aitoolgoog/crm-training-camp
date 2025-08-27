# 🚀 Zeabur 部署指南

## 📋 部署前檢查清單

### ✅ 專案準備
- [x] Docker 配置完成
- [x] 環境變數模板建立
- [x] 安全配置檢查
- [x] 健康檢查設置

## 🔐 安全設定重點

### 重要提醒
⚠️ **絕對不要將敏感資訊提交到 Git 倉庫**
- 資料庫密碼
- API 金鑰
- JWT Secret
- 任何其他機密資訊

## 🏗️ Zeabur 部署步驟

### 第1步：準備 Git 倉庫
```bash
# 初始化 Git (如果還沒有)
git init

# 檢查 .gitignore 是否包含敏感檔案
cat .gitignore

# 添加檔案到 Git
git add .
git commit -m "Initial commit: CRM system ready for deployment"

# 推送到 GitHub/GitLab
git remote add origin <your-repo-url>
git push -u origin main
```

### 第2步：登入 Zeabur
1. 前往 [Zeabur](https://zeabur.com)
2. 使用 GitHub/GitLab 帳號登入
3. 建立新的專案

### 第3步：部署應用
1. 點擊「Add Service」
2. 選擇「Git」
3. 選擇您的 CRM 倉庫
4. Zeabur 會自動偵測到 `Dockerfile` 並開始建置

### 第4步：設置 PostgreSQL 資料庫
1. 在同一個專案中，再次點擊「Add Service」
2. 選擇「PostgreSQL」
3. Zeabur 會自動建立 PostgreSQL 實例
4. 記下資料庫連接資訊

### 第5步：配置環境變數
在 Zeabur 專案設定中，添加以下環境變數：

#### 🔑 必要環境變數
```bash
# 基本設定
NODE_ENV=production
PORT=3000

# 資料庫連接 (從 Zeabur PostgreSQL 服務獲取)
DB_HOST=<zeabur-postgres-host>
DB_PORT=5432
DB_NAME=<your-database-name>
DB_USER=<zeabur-postgres-user>
DB_PASSWORD=<zeabur-postgres-password>

# CORS 設定 (將 your-app-name 替換為實際應用名稱)
CORS_ORIGIN=https://your-app-name.zeabur.app
```

#### 🛡️ 安全金鑰 (自行生成強密碼)
```bash
# JWT Secret (至少32字元)
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_chars

# Session Secret (至少32字元) 
SESSION_SECRET=your_super_secure_session_secret_for_cookies

# 加密金鑰 (32字元)
ENCRYPTION_KEY=your_32_character_encryption_key_
```

### 第6步：初始化資料庫
部署完成後，需要初始化資料庫：

1. 方法一：在 Zeabur 控制台中執行
   - 進入應用的「Console」
   - 執行：`npm run init-db`

2. 方法二：本地連接執行
   ```bash
   # 使用從 Zeabur 獲得的資料庫連接資訊
   DB_HOST=<zeabur-db-host> DB_USER=<user> DB_PASSWORD=<password> DB_NAME=<dbname> npm run init-db
   ```

### 第7步：測試部署
1. 訪問您的應用 URL：`https://your-app-name.zeabur.app`
2. 測試健康檢查：`https://your-app-name.zeabur.app/health`
3. 測試 API：`https://your-app-name.zeabur.app/api/status`

## 🔧 本地 Docker 測試

如果要在本地測試 Docker 容器：

```bash
# 建置映像
docker build -t crm-system .

# 運行容器 (使用演示模式)
docker run -p 3000:3000 -e NODE_ENV=development crm-system

# 或者連接真實資料庫
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your_db_host \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e DB_NAME=your_db_name \
  crm-system
```

## 📊 監控和維護

### 健康檢查
- URL: `https://your-app.zeabur.app/health`
- 返回應用狀態和運行時間

### 日誌查看
在 Zeabur 控制台的「Logs」分頁查看應用日誌

### 更新部署
推送新的 commit 到 GitHub/GitLab，Zeabur 會自動重新部署

## 🔍 故障排除

### 常見問題

1. **應用無法啟動**
   - 檢查環境變數是否正確設置
   - 查看 Zeabur 日誌了解錯誤訊息

2. **資料庫連接失敗**
   - 確認資料庫服務正在運行
   - 檢查資料庫連接參數

3. **CORS 錯誤**
   - 確保 `CORS_ORIGIN` 設定正確
   - 檢查域名是否匹配

### 安全檢查
- ✅ 敏感資訊未提交到 Git
- ✅ 環境變數在 Zeabur 控制台設置
- ✅ 使用強密碼和金鑰
- ✅ CORS 設置正確

## 📞 技術支援

如果遇到問題，請檢查：
1. Zeabur 官方文檔
2. 專案日誌檔案
3. GitHub Issues

## 🎉 部署成功！

恭喜！您的 CRM 系統現已成功部署到 Zeabur！

- 🌐 應用 URL: `https://your-app-name.zeabur.app`
- 💾 資料庫: PostgreSQL on Zeabur
- 🔒 安全性: 環境變數保護
- 📊 監控: 健康檢查和日誌

---

**重要提醒**: 請定期更新依賴套件和監控安全漏洞，保持系統安全性。