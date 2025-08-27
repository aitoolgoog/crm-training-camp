# CRM 訓練營學員管理系統

一個用於管理訓練營學員的完整 CRM 系統，使用 Node.js + Express + PostgreSQL 開發。

## 功能特色

### 學員管理
- ✅ 新增、編輯、刪除學員
- ✅ 學員資料搜尋
- ✅ 學員狀態管理
- ✅ 課程報名追蹤

### 課程管理
- ✅ 課程建立和管理
- ✅ 學員報名/退選
- ✅ 課程進度追蹤
- ✅ 報名人數統計

### 系統功能
- ✅ 響應式網頁介面
- ✅ RESTful API
- ✅ 資料庫關聯設計
- ✅ 錯誤處理和驗證

## 技術架構

- **後端**: Node.js + Express.js
- **資料庫**: PostgreSQL
- **前端**: HTML5 + Bootstrap 5 + JavaScript
- **部署**: Zeabur

## 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境設定
複製 `.env.example` 為 `.env` 並配置資料庫連接：
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_system
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=development
```

### 3. 資料庫設置
```bash
# 建立資料庫
createdb crm_system

# 初始化資料表和示例資料
npm run init-db
```

### 4. 啟動服務
```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

訪問 http://localhost:3000 開始使用系統

## API 端點

### 學員管理
- `GET /api/students` - 獲取所有學員
- `GET /api/students/:id` - 獲取單一學員
- `POST /api/students` - 新增學員
- `PUT /api/students/:id` - 更新學員
- `DELETE /api/students/:id` - 刪除學員
- `GET /api/students?search=關鍵字` - 搜尋學員

### 課程管理
- `GET /api/courses` - 獲取所有課程
- `GET /api/courses/:id` - 獲取單一課程
- `POST /api/courses` - 新增課程
- `PUT /api/courses/:id` - 更新課程
- `DELETE /api/courses/:id` - 刪除課程
- `POST /api/courses/:id/enroll` - 學員報名
- `DELETE /api/courses/:id/enroll/:student_id` - 學員退選
- `PUT /api/courses/:id/progress/:student_id` - 更新進度

## 資料庫結構

### students 學員表
- id (主鍵)
- name (姓名)
- email (信箱，唯一)
- phone (電話)
- address (地址)
- enrollment_date (入學日期)
- status (狀態)
- notes (備註)
- created_at, updated_at

### courses 課程表
- id (主鍵)
- name (課程名稱)
- description (課程描述)
- start_date (開始日期)
- end_date (結束日期)
- max_students (最大人數)
- status (狀態)
- created_at, updated_at

### student_courses 學員課程關聯表
- id (主鍵)
- student_id (學員ID，外鍵)
- course_id (課程ID，外鍵)
- enrollment_date (報名日期)
- completion_status (完成狀態)
- grade (成績)
- notes (備註)
- created_at

## 🚀 部署到 Zeabur

### 快速部署檢查
```bash
# 執行部署前檢查
npm run deploy-check
```

### 部署步驟概覽
1. **準備 Git 倉庫** - 推送代碼到 GitHub/GitLab
2. **連接 Zeabur** - 在 Zeabur 連接您的倉庫
3. **添加 PostgreSQL** - 在專案中添加 PostgreSQL 服務
4. **設置環境變數** - 配置安全的生產環境變數
5. **初始化資料庫** - 執行資料庫初始化腳本
6. **測試部署** - 確認應用正常運行

### 🔐 重要安全提醒
- ⚠️ **絕對不要將 .env 檔案提交到 Git**
- ✅ 在 Zeabur 控制台設置環境變數
- ✅ 使用強密碼和複雜的 JWT Secret
- ✅ 檢查 CORS 設置

### 📖 詳細部署指南
請查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解完整的部署步驟和故障排除指南。

### 🛠️ Docker 支援
本專案已完全容器化，支援 Docker 部署：
```bash
# 建置映像
docker build -t crm-system .

# 本地運行（演示模式）
docker run -p 3000:3000 crm-system
```

## 開發說明

### 專案結構
```
CRM2/
├── config/          # 資料庫配置
├── models/          # 資料模型
├── routes/          # API 路由
├── controllers/     # 控制器
├── middleware/      # 中介軟體
├── public/          # 靜態資源
│   ├── css/
│   └── js/
├── views/           # 前端頁面
├── scripts/         # 工具腳本
└── server.js        # 主伺服器檔案
```

### 代碼規範
- 使用 async/await 處理異步操作
- 統一的錯誤處理和回應格式
- 輸入資料驗證
- SQL 注入防護

## 授權

MIT License