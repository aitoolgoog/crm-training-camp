const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 模擬資料
const mockStudents = [
  {
    id: 1,
    name: '王小明',
    email: 'wang@example.com',
    phone: '0912-345-678',
    address: '台北市大安區',
    enrollment_date: '2024-01-15',
    status: 'active',
    notes: '積極學習的學員',
    enrolled_courses: 2
  },
  {
    id: 2,
    name: '李小華',
    email: 'lee@example.com',
    phone: '0923-456-789',
    address: '台中市西屯區',
    enrollment_date: '2024-02-01',
    status: 'active',
    notes: '表現優異',
    enrolled_courses: 1
  },
  {
    id: 3,
    name: '張小雯',
    email: 'chang@example.com',
    phone: '0934-567-890',
    address: '高雄市前金區',
    enrollment_date: '2024-01-20',
    status: 'completed',
    notes: '已完成所有課程',
    enrolled_courses: 3
  }
];

const mockCourses = [
  {
    id: 1,
    name: 'Claude 基礎訓練營',
    description: '學習 Claude AI 的基本概念和應用',
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    max_students: 30,
    enrolled_students: 25,
    status: 'active'
  },
  {
    id: 2,
    name: 'Claude 進階應用',
    description: '深入學習 Claude AI 的進階功能',
    start_date: '2024-02-01',
    end_date: '2024-04-01',
    max_students: 25,
    enrolled_students: 18,
    status: 'active'
  },
  {
    id: 3,
    name: 'AI 開發實戰',
    description: '實際動手開發 AI 應用專案',
    start_date: '2024-03-01',
    end_date: '2024-05-01',
    max_students: 20,
    enrolled_students: 12,
    status: 'active'
  }
];

// 學員課程關聯模擬資料
const mockEnrollments = [
  {
    id: 1,
    student_id: 1,
    course_id: 1,
    enrollment_date: '2024-01-15',
    completion_status: 'enrolled',
    grade: 'A',
    notes: '學習狀況良好'
  },
  {
    id: 2,
    student_id: 1,
    course_id: 2,
    enrollment_date: '2024-02-01',
    completion_status: 'in_progress',
    grade: null,
    notes: '積極參與'
  },
  {
    id: 3,
    student_id: 2,
    course_id: 1,
    enrollment_date: '2024-01-20',
    completion_status: 'completed',
    grade: 'A+',
    notes: '表現優異'
  },
  {
    id: 4,
    student_id: 3,
    course_id: 1,
    enrollment_date: '2024-01-15',
    completion_status: 'completed',
    grade: 'A',
    notes: '已完成課程'
  },
  {
    id: 5,
    student_id: 3,
    course_id: 2,
    enrollment_date: '2024-02-01',
    completion_status: 'completed',
    grade: 'B+',
    notes: '努力學習'
  },
  {
    id: 6,
    student_id: 3,
    course_id: 3,
    enrollment_date: '2024-03-01',
    completion_status: 'completed',
    grade: 'A',
    notes: '實戰能力強'
  }
];

// 輔助函數：更新學員報名課程數
function updateStudentEnrollmentCount() {
  mockStudents.forEach(student => {
    const enrollmentCount = mockEnrollments.filter(e => e.student_id === student.id).length;
    student.enrolled_courses = enrollmentCount;
  });
}

// 輔助函數：更新課程報名人數
function updateCourseEnrollmentCount() {
  mockCourses.forEach(course => {
    const enrollmentCount = mockEnrollments.filter(e => e.course_id === course.id).length;
    course.enrolled_students = enrollmentCount;
  });
}

// 初始化報名數據
updateStudentEnrollmentCount();
updateCourseEnrollmentCount();

// 學員 API 路由
app.get('/api/students', (req, res) => {
  const { search } = req.query;
  let students = mockStudents;
  
  if (search) {
    students = mockStudents.filter(student => 
      student.name.includes(search) || student.email.includes(search)
    );
  }
  
  res.json({
    success: true,
    data: students,
    count: students.length
  });
});

app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const student = mockStudents.find(s => s.id === parseInt(id));
  
  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  // 獲取學員的課程資訊
  const studentEnrollments = mockEnrollments.filter(e => e.student_id === parseInt(id));
  const courses = studentEnrollments.map(enrollment => {
    const course = mockCourses.find(c => c.id === enrollment.course_id);
    return {
      course_id: course.id,
      course_name: course.name,
      course_description: course.description,
      enrollment_date: enrollment.enrollment_date,
      completion_status: enrollment.completion_status,
      grade: enrollment.grade,
      notes: enrollment.notes
    };
  });

  const studentWithCourses = {
    ...student,
    courses: courses
  };
  
  res.json({
    success: true,
    data: studentWithCourses
  });
});

app.post('/api/students', (req, res) => {
  const { name, email, phone, address, notes } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required'
    });
  }
  
  const newStudent = {
    id: mockStudents.length + 1,
    name,
    email,
    phone: phone || '',
    address: address || '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: notes || '',
    enrolled_courses: 0
  };
  
  mockStudents.push(newStudent);
  
  res.status(201).json({
    success: true,
    data: newStudent,
    message: 'Student created successfully'
  });
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const index = mockStudents.findIndex(s => s.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }
  
  const deletedStudent = mockStudents.splice(index, 1)[0];
  
  res.json({
    success: true,
    data: deletedStudent,
    message: 'Student deleted successfully'
  });
});

// 課程 API 路由
app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    data: mockCourses,
    count: mockCourses.length
  });
});

app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const course = mockCourses.find(c => c.id === parseInt(id));
  
  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found'
    });
  }

  // 獲取課程的學員資訊
  const courseEnrollments = mockEnrollments.filter(e => e.course_id === parseInt(id));
  const students = courseEnrollments.map(enrollment => {
    const student = mockStudents.find(s => s.id === enrollment.student_id);
    return {
      student_id: student.id,
      student_name: student.name,
      student_email: student.email,
      student_phone: student.phone,
      enrollment_date: enrollment.enrollment_date,
      completion_status: enrollment.completion_status,
      grade: enrollment.grade,
      notes: enrollment.notes
    };
  });

  const courseWithStudents = {
    ...course,
    students: students
  };
  
  res.json({
    success: true,
    data: courseWithStudents
  });
});

app.post('/api/courses', (req, res) => {
  const { name, description, start_date, end_date, max_students } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Course name is required'
    });
  }
  
  const newCourse = {
    id: mockCourses.length + 1,
    name,
    description: description || '',
    start_date: start_date || '',
    end_date: end_date || '',
    max_students: max_students || 50,
    enrolled_students: 0,
    status: 'active'
  };
  
  mockCourses.push(newCourse);
  
  res.status(201).json({
    success: true,
    data: newCourse,
    message: 'Course created successfully'
  });
});

app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const index = mockCourses.findIndex(c => c.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Course not found'
    });
  }
  
  const deletedCourse = mockCourses.splice(index, 1)[0];
  
  res.json({
    success: true,
    data: deletedCourse,
    message: 'Course deleted successfully'
  });
});

// 學員報名課程
app.post('/api/courses/:id/enroll', (req, res) => {
  const { id } = req.params;
  const { student_id, notes } = req.body;
  
  if (!student_id) {
    return res.status(400).json({
      success: false,
      error: 'Student ID is required'
    });
  }

  const course = mockCourses.find(c => c.id === parseInt(id));
  const student = mockStudents.find(s => s.id === parseInt(student_id));

  if (!course || !student) {
    return res.status(404).json({
      success: false,
      error: 'Course or student not found'
    });
  }

  // 檢查是否已經報名
  const existingEnrollment = mockEnrollments.find(e => 
    e.course_id === parseInt(id) && e.student_id === parseInt(student_id)
  );

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      error: 'Student already enrolled in this course'
    });
  }

  const newEnrollment = {
    id: mockEnrollments.length + 1,
    student_id: parseInt(student_id),
    course_id: parseInt(id),
    enrollment_date: new Date().toISOString().split('T')[0],
    completion_status: 'enrolled',
    grade: null,
    notes: notes || ''
  };

  mockEnrollments.push(newEnrollment);
  updateStudentEnrollmentCount();
  updateCourseEnrollmentCount();
  
  res.status(201).json({
    success: true,
    data: newEnrollment,
    message: 'Student enrolled successfully'
  });
});

// 學員退選課程
app.delete('/api/courses/:id/enroll/:student_id', (req, res) => {
  const { id, student_id } = req.params;
  const enrollmentIndex = mockEnrollments.findIndex(e => 
    e.course_id === parseInt(id) && e.student_id === parseInt(student_id)
  );
  
  if (enrollmentIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Enrollment not found'
    });
  }
  
  const deletedEnrollment = mockEnrollments.splice(enrollmentIndex, 1)[0];
  updateStudentEnrollmentCount();
  updateCourseEnrollmentCount();
  
  res.json({
    success: true,
    data: deletedEnrollment,
    message: 'Student unenrolled successfully'
  });
});

// 更新學員課程進度
app.put('/api/courses/:id/progress/:student_id', (req, res) => {
  const { id, student_id } = req.params;
  const { completion_status, grade, notes } = req.body;
  
  const enrollment = mockEnrollments.find(e => 
    e.course_id === parseInt(id) && e.student_id === parseInt(student_id)
  );
  
  if (!enrollment) {
    return res.status(404).json({
      success: false,
      error: 'Enrollment not found'
    });
  }

  if (completion_status) enrollment.completion_status = completion_status;
  if (grade !== undefined) enrollment.grade = grade;
  if (notes !== undefined) enrollment.notes = notes;
  
  res.json({
    success: true,
    data: enrollment,
    message: 'Student progress updated successfully'
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
  console.log(`🚀 Demo server is running on http://localhost:${PORT}`);
  console.log('📝 This is a demo version with mock data - no database required!');
  console.log('📖 Open http://localhost:3000 in your browser to test the CRM system');
});