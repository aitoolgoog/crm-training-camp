class CRMApp {
    constructor() {
        this.currentSection = 'students';
        this.students = [];
        this.courses = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showStudentsSection();
        this.loadStudents();
    }

    setupEventListeners() {
        // 導航事件
        document.getElementById('studentsTab').addEventListener('click', (e) => {
            e.preventDefault();
            this.showStudentsSection();
        });

        document.getElementById('coursesTab').addEventListener('click', (e) => {
            e.preventDefault();
            this.showCoursesSection();
        });

        // 學員相關事件
        document.getElementById('saveStudentBtn').addEventListener('click', () => {
            this.saveStudent();
        });

        document.getElementById('searchStudentBtn').addEventListener('click', () => {
            this.searchStudents();
        });

        document.getElementById('studentSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchStudents();
            }
        });

        // 課程相關事件
        document.getElementById('saveCourseBtn').addEventListener('click', () => {
            this.saveCourse();
        });

        // 詳細檢視相關事件
        document.getElementById('addStudentToCourseBtn').addEventListener('click', () => {
            this.showEnrollModal();
        });

        document.getElementById('enrollStudentInCourseBtn').addEventListener('click', () => {
            this.showSelectCourseModal();
        });

        document.getElementById('confirmEnrollBtn').addEventListener('click', () => {
            this.enrollStudentInCourse();
        });

        document.getElementById('confirmSelectCourseBtn').addEventListener('click', () => {
            this.enrollStudentInSelectedCourse();
        });
    }

    showStudentsSection() {
        document.getElementById('studentsSection').style.display = 'block';
        document.getElementById('coursesSection').style.display = 'none';
        document.getElementById('studentsTab').classList.add('active');
        document.getElementById('coursesTab').classList.remove('active');
        this.currentSection = 'students';
        this.loadStudents();
    }

    showCoursesSection() {
        document.getElementById('studentsSection').style.display = 'none';
        document.getElementById('coursesSection').style.display = 'block';
        document.getElementById('studentsTab').classList.remove('active');
        document.getElementById('coursesTab').classList.add('active');
        this.currentSection = 'courses';
        this.loadCourses();
    }

    async loadStudents() {
        try {
            const response = await fetch('/api/students');
            const data = await response.json();
            
            if (data.success) {
                this.students = data.data;
                this.renderStudentsTable();
            } else {
                this.showToast('載入學員資料失敗', 'error');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.showToast('載入學員資料時發生錯誤', 'error');
        }
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/courses');
            const data = await response.json();
            
            if (data.success) {
                this.courses = data.data;
                this.renderCoursesTable();
            } else {
                this.showToast('載入課程資料失敗', 'error');
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showToast('載入課程資料時發生錯誤', 'error');
        }
    }

    renderStudentsTable() {
        const tbody = document.getElementById('studentsTable');
        
        if (this.students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>目前沒有學員資料</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.students.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.phone || '-'}</td>
                <td>${this.formatDate(student.enrollment_date)}</td>
                <td>
                    <span class="badge status-${student.status}">
                        ${this.getStatusText(student.status)}
                    </span>
                </td>
                <td>${student.enrolled_courses || 0}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="app.showStudentDetail(${student.id})" title="查看詳情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary ms-1" onclick="app.editStudent(${student.id})" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" onclick="app.deleteStudent(${student.id})" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderCoursesTable() {
        const tbody = document.getElementById('coursesTable');
        
        if (this.courses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-book"></i>
                            <p>目前沒有課程資料</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.courses.map(course => `
            <tr>
                <td>${course.id}</td>
                <td>${course.name}</td>
                <td>${this.formatDate(course.start_date)}</td>
                <td>${this.formatDate(course.end_date)}</td>
                <td>${course.max_students}</td>
                <td>${course.enrolled_students || 0}</td>
                <td>
                    <span class="badge status-${course.status}">
                        ${this.getStatusText(course.status)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="app.showCourseDetail(${course.id})" title="查看詳情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary ms-1" onclick="app.editCourse(${course.id})" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" onclick="app.deleteCourse(${course.id})" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async saveStudent() {
        const name = document.getElementById('studentName').value.trim();
        const email = document.getElementById('studentEmail').value.trim();
        const phone = document.getElementById('studentPhone').value.trim();
        const address = document.getElementById('studentAddress').value.trim();
        const notes = document.getElementById('studentNotes').value.trim();

        if (!name || !email) {
            this.showToast('請填寫必填欄位', 'error');
            return;
        }

        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, address, notes })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('學員新增成功', 'success');
                this.clearStudentForm();
                bootstrap.Modal.getInstance(document.getElementById('addStudentModal')).hide();
                this.loadStudents();
            } else {
                this.showToast(data.error || '新增學員失敗', 'error');
            }
        } catch (error) {
            console.error('Error saving student:', error);
            this.showToast('新增學員時發生錯誤', 'error');
        }
    }

    async saveCourse() {
        const name = document.getElementById('courseName').value.trim();
        const description = document.getElementById('courseDescription').value.trim();
        const start_date = document.getElementById('courseStartDate').value;
        const end_date = document.getElementById('courseEndDate').value;
        const max_students = parseInt(document.getElementById('courseMaxStudents').value);

        if (!name) {
            this.showToast('請填寫課程名稱', 'error');
            return;
        }

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, start_date, end_date, max_students })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('課程新增成功', 'success');
                this.clearCourseForm();
                bootstrap.Modal.getInstance(document.getElementById('addCourseModal')).hide();
                this.loadCourses();
            } else {
                this.showToast(data.error || '新增課程失敗', 'error');
            }
        } catch (error) {
            console.error('Error saving course:', error);
            this.showToast('新增課程時發生錯誤', 'error');
        }
    }

    async searchStudents() {
        const searchTerm = document.getElementById('studentSearch').value.trim();
        
        try {
            const url = searchTerm ? `/api/students?search=${encodeURIComponent(searchTerm)}` : '/api/students';
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.students = data.data;
                this.renderStudentsTable();
            } else {
                this.showToast('搜尋學員失敗', 'error');
            }
        } catch (error) {
            console.error('Error searching students:', error);
            this.showToast('搜尋時發生錯誤', 'error');
        }
    }

    async deleteStudent(id) {
        if (!confirm('確定要刪除這名學員嗎？')) {
            return;
        }

        try {
            const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('學員刪除成功', 'success');
                this.loadStudents();
            } else {
                this.showToast(data.error || '刪除學員失敗', 'error');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showToast('刪除學員時發生錯誤', 'error');
        }
    }

    async deleteCourse(id) {
        if (!confirm('確定要刪除這個課程嗎？')) {
            return;
        }

        try {
            const response = await fetch(`/api/courses/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('課程刪除成功', 'success');
                this.loadCourses();
            } else {
                this.showToast(data.error || '刪除課程失敗', 'error');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showToast('刪除課程時發生錯誤', 'error');
        }
    }

    clearStudentForm() {
        document.getElementById('studentName').value = '';
        document.getElementById('studentEmail').value = '';
        document.getElementById('studentPhone').value = '';
        document.getElementById('studentAddress').value = '';
        document.getElementById('studentNotes').value = '';
    }

    clearCourseForm() {
        document.getElementById('courseName').value = '';
        document.getElementById('courseDescription').value = '';
        document.getElementById('courseStartDate').value = '';
        document.getElementById('courseEndDate').value = '';
        document.getElementById('courseMaxStudents').value = '50';
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW');
    }

    getStatusText(status) {
        const statusMap = {
            'active': '啟用',
            'inactive': '停用',
            'completed': '完成',
            'dropped': '退選',
            'enrolled': '已報名'
        };
        return statusMap[status] || status;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastBody = toast.querySelector('.toast-body');
        
        toastBody.textContent = message;
        
        // 設置不同類型的樣式
        toast.className = 'toast';
        if (type === 'success') {
            toast.classList.add('text-bg-success');
        } else if (type === 'error') {
            toast.classList.add('text-bg-danger');
        } else {
            toast.classList.add('text-bg-info');
        }
        
        const toastInstance = new bootstrap.Toast(toast);
        toastInstance.show();
    }

    // 顯示學員詳細資訊
    async showStudentDetail(id) {
        try {
            const response = await fetch(`/api/students/${id}`);
            const data = await response.json();

            if (data.success) {
                const student = data.data;
                const content = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-user"></i> 基本資訊</h6>
                            <table class="table table-borderless table-sm">
                                <tr><td><strong>姓名:</strong></td><td>${student.name}</td></tr>
                                <tr><td><strong>信箱:</strong></td><td>${student.email}</td></tr>
                                <tr><td><strong>電話:</strong></td><td>${student.phone || '-'}</td></tr>
                                <tr><td><strong>地址:</strong></td><td>${student.address || '-'}</td></tr>
                                <tr><td><strong>入學日期:</strong></td><td>${this.formatDate(student.enrollment_date)}</td></tr>
                                <tr><td><strong>狀態:</strong></td><td><span class="badge status-${student.status}">${this.getStatusText(student.status)}</span></td></tr>
                                <tr><td><strong>備註:</strong></td><td>${student.notes || '-'}</td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-book"></i> 報名課程</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>課程名稱</th>
                                            <th>報名日期</th>
                                            <th>狀態</th>
                                            <th>成績</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${student.courses && student.courses.length > 0 ? 
                                            student.courses.map(course => `
                                                <tr>
                                                    <td>${course.course_name}</td>
                                                    <td>${this.formatDate(course.enrollment_date)}</td>
                                                    <td><span class="badge status-${course.completion_status}">${this.getStatusText(course.completion_status)}</span></td>
                                                    <td>${course.grade || '-'}</td>
                                                    <td>
                                                        <button class="btn btn-sm btn-outline-danger" onclick="app.unenrollStudentFromCourse(${course.course_id}, ${student.id})" title="退選">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('') : 
                                            '<tr><td colspan="5" class="text-center">尚未報名任何課程</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;

                document.getElementById('studentDetailContent').innerHTML = content;
                this.currentStudentId = id;
                
                const modal = new bootstrap.Modal(document.getElementById('studentDetailModal'));
                modal.show();
            } else {
                this.showToast('載入學員詳細資訊失敗', 'error');
            }
        } catch (error) {
            console.error('Error loading student detail:', error);
            this.showToast('載入學員詳細資訊時發生錯誤', 'error');
        }
    }

    // 顯示課程詳細資訊
    async showCourseDetail(id) {
        try {
            const response = await fetch(`/api/courses/${id}`);
            const data = await response.json();

            if (data.success) {
                const course = data.data;
                const content = `
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-book"></i> 課程資訊</h6>
                            <table class="table table-borderless table-sm">
                                <tr><td><strong>課程名稱:</strong></td><td>${course.name}</td></tr>
                                <tr><td><strong>描述:</strong></td><td>${course.description || '-'}</td></tr>
                                <tr><td><strong>開始日期:</strong></td><td>${this.formatDate(course.start_date)}</td></tr>
                                <tr><td><strong>結束日期:</strong></td><td>${this.formatDate(course.end_date)}</td></tr>
                                <tr><td><strong>最大人數:</strong></td><td>${course.max_students}</td></tr>
                                <tr><td><strong>目前報名:</strong></td><td>${course.enrolled_students}</td></tr>
                                <tr><td><strong>狀態:</strong></td><td><span class="badge status-${course.status}">${this.getStatusText(course.status)}</span></td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-users"></i> 報名學員</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-striped">
                                    <thead>
                                        <tr>
                                            <th>學員姓名</th>
                                            <th>信箱</th>
                                            <th>報名日期</th>
                                            <th>狀態</th>
                                            <th>成績</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${course.students && course.students.length > 0 ? 
                                            course.students.map(student => `
                                                <tr>
                                                    <td>${student.student_name}</td>
                                                    <td>${student.student_email}</td>
                                                    <td>${this.formatDate(student.enrollment_date)}</td>
                                                    <td><span class="badge status-${student.completion_status}">${this.getStatusText(student.completion_status)}</span></td>
                                                    <td>${student.grade || '-'}</td>
                                                    <td>
                                                        <button class="btn btn-sm btn-outline-danger" onclick="app.unenrollStudentFromCourse(${id}, ${student.student_id})" title="退選">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('') : 
                                            '<tr><td colspan="6" class="text-center">目前無學員報名</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;

                document.getElementById('courseDetailContent').innerHTML = content;
                this.currentCourseId = id;
                
                const modal = new bootstrap.Modal(document.getElementById('courseDetailModal'));
                modal.show();
            } else {
                this.showToast('載入課程詳細資訊失敗', 'error');
            }
        } catch (error) {
            console.error('Error loading course detail:', error);
            this.showToast('載入課程詳細資訊時發生錯誤', 'error');
        }
    }

    // 顯示報名模態框
    async showEnrollModal() {
        try {
            const response = await fetch('/api/students');
            const data = await response.json();

            if (data.success) {
                const select = document.getElementById('enrollStudentSelect');
                select.innerHTML = '<option value="">請選擇學員</option>';
                
                data.data.forEach(student => {
                    select.innerHTML += `<option value="${student.id}">${student.name} (${student.email})</option>`;
                });

                document.getElementById('enrollCourseId').value = this.currentCourseId;
                
                const enrollModal = new bootstrap.Modal(document.getElementById('enrollModal'));
                enrollModal.show();
            } else {
                this.showToast('載入學員列表失敗', 'error');
            }
        } catch (error) {
            console.error('Error loading students for enrollment:', error);
            this.showToast('載入學員列表時發生錯誤', 'error');
        }
    }

    // 顯示課程選擇模態框
    async showSelectCourseModal() {
        try {
            const response = await fetch('/api/courses');
            const data = await response.json();

            if (data.success) {
                const select = document.getElementById('selectCourseSelect');
                select.innerHTML = '<option value="">請選擇課程</option>';
                
                data.data.forEach(course => {
                    select.innerHTML += `<option value="${course.id}">${course.name}</option>`;
                });

                document.getElementById('selectCourseStudentId').value = this.currentStudentId;
                
                const selectCourseModal = new bootstrap.Modal(document.getElementById('selectCourseModal'));
                selectCourseModal.show();
            } else {
                this.showToast('載入課程列表失敗', 'error');
            }
        } catch (error) {
            console.error('Error loading courses for selection:', error);
            this.showToast('載入課程列表時發生錯誤', 'error');
        }
    }

    // 為課程添加學員
    async enrollStudentInCourse() {
        const courseId = document.getElementById('enrollCourseId').value;
        const studentId = document.getElementById('enrollStudentSelect').value;
        const notes = document.getElementById('enrollNotes').value;

        if (!studentId) {
            this.showToast('請選擇學員', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ student_id: parseInt(studentId), notes })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('學員報名成功', 'success');
                bootstrap.Modal.getInstance(document.getElementById('enrollModal')).hide();
                this.showCourseDetail(courseId); // 重新載入課程詳情
                this.loadCourses(); // 更新課程列表
            } else {
                this.showToast(data.error || '報名失敗', 'error');
            }
        } catch (error) {
            console.error('Error enrolling student:', error);
            this.showToast('報名時發生錯誤', 'error');
        }
    }

    // 為學員報名選定課程
    async enrollStudentInSelectedCourse() {
        const studentId = document.getElementById('selectCourseStudentId').value;
        const courseId = document.getElementById('selectCourseSelect').value;
        const notes = document.getElementById('selectCourseNotes').value;

        if (!courseId) {
            this.showToast('請選擇課程', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ student_id: parseInt(studentId), notes })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('課程報名成功', 'success');
                bootstrap.Modal.getInstance(document.getElementById('selectCourseModal')).hide();
                this.showStudentDetail(studentId); // 重新載入學員詳情
                this.loadStudents(); // 更新學員列表
            } else {
                this.showToast(data.error || '報名失敗', 'error');
            }
        } catch (error) {
            console.error('Error enrolling student in course:', error);
            this.showToast('報名時發生錯誤', 'error');
        }
    }

    // 學員退選課程
    async unenrollStudentFromCourse(courseId, studentId) {
        if (!confirm('確定要退選這個課程嗎？')) {
            return;
        }

        try {
            const response = await fetch(`/api/courses/${courseId}/enroll/${studentId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('退選成功', 'success');
                // 重新載入相關數據
                if (this.currentCourseId) {
                    this.showCourseDetail(courseId);
                }
                if (this.currentStudentId) {
                    this.showStudentDetail(studentId);
                }
                this.loadStudents();
                this.loadCourses();
            } else {
                this.showToast(data.error || '退選失敗', 'error');
            }
        } catch (error) {
            console.error('Error unenrolling student:', error);
            this.showToast('退選時發生錯誤', 'error');
        }
    }

    // 暫時的編輯功能佔位符
    editStudent(id) {
        this.showToast('編輯功能開發中', 'info');
    }

    editCourse(id) {
        this.showToast('編輯功能開發中', 'info');
    }
}

// 初始化應用
const app = new CRMApp();