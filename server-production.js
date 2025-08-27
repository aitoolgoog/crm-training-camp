const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全性中介軟體配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN, 'https://*.zeabur.app'] 
    : 'http://localhost:3000',
  credentials: true
};

// 中介軟體
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 設置安全標頭
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// 路由
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');

app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);

// 健康檢查路由 (包含資料庫連接檢查)
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'disconnected'
  };

  try {
    // 檢查資料庫連接
    const pool = require('./config/database');
    const result = await pool.query('SELECT NOW() as current_time');
    healthCheck.database = 'connected';
    healthCheck.db_time = result.rows[0].current_time;
  } catch (error) {
    console.error('Health check database error:', error);
    healthCheck.status = 'unhealthy';
    healthCheck.database = 'disconnected';
    healthCheck.db_error = error.message;
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// API 狀態路由
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CRM API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 主頁面路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 錯誤處理中介軟體
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // 生產環境不暴露詳細錯誤
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 CRM Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});