const { Pool } = require('pg');
require('dotenv').config();

// 優先使用 Zeabur 自動生成的 POSTGRES_* 環境變數，然後是自定義的 DB_* 變數
const pool = new Pool({
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || process.env.DB_PORT || 5432,
  database: process.env.POSTGRES_DATABASE || process.env.DB_NAME || 'crm_system',
  user: process.env.POSTGRES_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'password',
  // 生產環境額外的 SSL 設定
  ...(process.env.NODE_ENV === 'production' && {
    ssl: process.env.POSTGRES_SSL_DISABLED !== 'true' ? { rejectUnauthorized: false } : false
  })
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;