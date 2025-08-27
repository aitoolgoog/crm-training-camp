const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 路由
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');

app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);

// 健康檢查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
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
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});