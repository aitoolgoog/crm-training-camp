const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// 獲取所有學員
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let students;
    
    if (search) {
      students = await Student.search(search);
    } else {
      students = await Student.getAll();
    }
    
    res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
});

// 獲取單一學員詳細資料
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.getWithCourses(id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student'
    });
  }
});

// 新增學員
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const student = await Student.create({
      name,
      email,
      phone,
      address,
      notes
    });
    
    res.status(201).json({
      success: true,
      data: student,
      message: 'Student created successfully'
    });
  } catch (error) {
    console.error('Error creating student:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create student'
    });
  }
});

// 更新學員資料
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, status, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    const student = await Student.update(id, {
      name,
      email,
      phone,
      address,
      status,
      notes
    });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: student,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update student'
    });
  }
});

// 刪除學員
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.delete(id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: student,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete student'
    });
  }
});

module.exports = router;