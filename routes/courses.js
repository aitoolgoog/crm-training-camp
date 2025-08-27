const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// 獲取所有課程
router.get('/', async (req, res) => {
  try {
    const courses = await Course.getAll();
    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
});

// 獲取單一課程詳細資料
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.getWithStudents(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course'
    });
  }
});

// 新增課程
router.post('/', async (req, res) => {
  try {
    const { name, description, start_date, end_date, max_students } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Course name is required'
      });
    }
    
    const course = await Course.create({
      name,
      description,
      start_date,
      end_date,
      max_students: max_students || 50
    });
    
    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create course'
    });
  }
});

// 更新課程資料
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, start_date, end_date, max_students, status } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Course name is required'
      });
    }
    
    const course = await Course.update(id, {
      name,
      description,
      start_date,
      end_date,
      max_students,
      status
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update course'
    });
  }
});

// 刪除課程
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.delete(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: course,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete course'
    });
  }
});

// 學員報名課程
router.post('/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, notes } = req.body;
    
    if (!student_id) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    const enrollment = await Course.enrollStudent(id, student_id, notes);
    
    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Student enrolled successfully'
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'Student already enrolled in this course'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to enroll student'
    });
  }
});

// 學員退選課程
router.delete('/:id/enroll/:student_id', async (req, res) => {
  try {
    const { id, student_id } = req.params;
    const enrollment = await Course.unenrollStudent(id, student_id);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }
    
    res.json({
      success: true,
      data: enrollment,
      message: 'Student unenrolled successfully'
    });
  } catch (error) {
    console.error('Error unenrolling student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unenroll student'
    });
  }
});

// 更新學員課程進度
router.put('/:id/progress/:student_id', async (req, res) => {
  try {
    const { id, student_id } = req.params;
    const { completion_status, grade, notes } = req.body;
    
    const progress = await Course.updateStudentProgress(id, student_id, {
      completion_status,
      grade,
      notes
    });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }
    
    res.json({
      success: true,
      data: progress,
      message: 'Student progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating student progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update student progress'
    });
  }
});

module.exports = router;