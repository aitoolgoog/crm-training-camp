const pool = require('../config/database');

const createTables = async () => {
  try {
    // 建立課程表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        max_students INTEGER DEFAULT 50,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 建立學員表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        enrollment_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 建立學員課程關聯表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_courses (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        enrollment_date DATE DEFAULT CURRENT_DATE,
        completion_status VARCHAR(20) DEFAULT 'enrolled',
        grade VARCHAR(10),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      );
    `);

    // 插入示例課程資料
    await pool.query(`
      INSERT INTO courses (name, description, start_date, end_date, max_students) 
      VALUES 
        ('Claude 基礎訓練營', 'Learn Claude AI basics and implementation', '2024-01-15', '2024-03-15', 30),
        ('Claude 進階應用', 'Advanced Claude AI applications and integrations', '2024-02-01', '2024-04-01', 25),
        ('AI 開發實戰', 'Hands-on AI development with practical projects', '2024-03-01', '2024-05-01', 20)
      ON CONFLICT DO NOTHING;
    `);

    console.log('Database tables created successfully!');
    console.log('Sample data inserted!');

  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
};

createTables();