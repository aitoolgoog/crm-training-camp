const pool = require('../config/database');

class Student {
  static async getAll() {
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(sc.course_id) as enrolled_courses
      FROM students s
      LEFT JOIN student_courses sc ON s.id = sc.student_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(studentData) {
    const { name, email, phone, address, notes } = studentData;
    const result = await pool.query(`
      INSERT INTO students (name, email, phone, address, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, email, phone, address, notes]);
    return result.rows[0];
  }

  static async update(id, studentData) {
    const { name, email, phone, address, status, notes } = studentData;
    const result = await pool.query(`
      UPDATE students 
      SET name = $1, email = $2, phone = $3, address = $4, 
          status = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [name, email, phone, address, status, notes, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async search(searchTerm) {
    const result = await pool.query(`
      SELECT s.*, 
             COUNT(sc.course_id) as enrolled_courses
      FROM students s
      LEFT JOIN student_courses sc ON s.id = sc.student_id
      WHERE s.name ILIKE $1 OR s.email ILIKE $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [`%${searchTerm}%`]);
    return result.rows;
  }

  static async getWithCourses(id) {
    const result = await pool.query(`
      SELECT s.*, 
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'course_id', c.id,
                   'course_name', c.name,
                   'enrollment_date', sc.enrollment_date,
                   'completion_status', sc.completion_status,
                   'grade', sc.grade
                 )
               ) FILTER (WHERE c.id IS NOT NULL), 
               '[]'
             ) as courses
      FROM students s
      LEFT JOIN student_courses sc ON s.id = sc.student_id
      LEFT JOIN courses c ON sc.course_id = c.id
      WHERE s.id = $1
      GROUP BY s.id
    `, [id]);
    return result.rows[0];
  }
}

module.exports = Student;