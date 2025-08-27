const pool = require('../config/database');

class Course {
  static async getAll() {
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(sc.student_id) as enrolled_students
      FROM courses c
      LEFT JOIN student_courses sc ON c.id = sc.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(courseData) {
    const { name, description, start_date, end_date, max_students } = courseData;
    const result = await pool.query(`
      INSERT INTO courses (name, description, start_date, end_date, max_students)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, start_date, end_date, max_students]);
    return result.rows[0];
  }

  static async update(id, courseData) {
    const { name, description, start_date, end_date, max_students, status } = courseData;
    const result = await pool.query(`
      UPDATE courses 
      SET name = $1, description = $2, start_date = $3, end_date = $4, 
          max_students = $5, status = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [name, description, start_date, end_date, max_students, status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getWithStudents(id) {
    const result = await pool.query(`
      SELECT c.*, 
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'student_id', s.id,
                   'student_name', s.name,
                   'student_email', s.email,
                   'enrollment_date', sc.enrollment_date,
                   'completion_status', sc.completion_status,
                   'grade', sc.grade
                 )
               ) FILTER (WHERE s.id IS NOT NULL), 
               '[]'
             ) as students
      FROM courses c
      LEFT JOIN student_courses sc ON c.id = sc.course_id
      LEFT JOIN students s ON sc.student_id = s.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);
    return result.rows[0];
  }

  static async enrollStudent(courseId, studentId, notes = '') {
    const result = await pool.query(`
      INSERT INTO student_courses (course_id, student_id, notes)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [courseId, studentId, notes]);
    return result.rows[0];
  }

  static async unenrollStudent(courseId, studentId) {
    const result = await pool.query(`
      DELETE FROM student_courses 
      WHERE course_id = $1 AND student_id = $2
      RETURNING *
    `, [courseId, studentId]);
    return result.rows[0];
  }

  static async updateStudentProgress(courseId, studentId, progressData) {
    const { completion_status, grade, notes } = progressData;
    const result = await pool.query(`
      UPDATE student_courses 
      SET completion_status = $1, grade = $2, notes = $3
      WHERE course_id = $4 AND student_id = $5
      RETURNING *
    `, [completion_status, grade, notes, courseId, studentId]);
    return result.rows[0];
  }
}

module.exports = Course;