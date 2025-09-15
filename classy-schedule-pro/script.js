// Timetable Management System - Vanilla JavaScript

// Data Storage
let faculty = JSON.parse(localStorage.getItem('timetable-faculty') || '[]');
let subjects = JSON.parse(localStorage.getItem('timetable-subjects') || '[]');
let timetable = JSON.parse(localStorage.getItem('timetable-schedule') || '[]');

// Constants
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = ['9-10', '10-11', '11-12', '12-1', '2-3', '3-4'];
const TOTAL_SLOTS = DAYS.length * TIMES.length;

// Utility Functions
function saveToStorage() {
    localStorage.setItem('timetable-faculty', JSON.stringify(faculty));
    localStorage.setItem('timetable-subjects', JSON.stringify(subjects));
    localStorage.setItem('timetable-schedule', JSON.stringify(timetable));
}

function showToast(title, description, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <h4 class="toast-title">${title}</h4>
        <p class="toast-description">${description}</p>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tab Navigation
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Update content when switching tabs
            updateActiveTabContent(targetTab);
        });
    });
}

function updateActiveTabContent(tab) {
    switch(tab) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'faculty':
            updateFacultyList();
            break;
        case 'subjects':
            updateSubjectList();
            break;
        case 'timetable':
            updateTimetableDropdowns();
            updateTimetableGrid();
            break;
    }
}

// Dashboard Functions
function updateDashboard() {
    // Update statistics
    document.getElementById('total-faculty').textContent = faculty.length;
    document.getElementById('total-subjects').textContent = subjects.length;
    
    const filledSlots = timetable.filter(slot => slot.facultyId).length;
    document.getElementById('filled-slots').textContent = `${filledSlots}/${TOTAL_SLOTS}`;
    
    const totalSubjectHours = subjects.reduce((sum, subject) => sum + subject.hoursPerWeek, 0);
    const assignedSubjectHours = subjects.reduce((sum, subject) => sum + subject.assignedHours, 0);
    document.getElementById('subject-hours').textContent = `${assignedSubjectHours}/${totalSubjectHours}`;
    
    // Update faculty workload
    updateFacultyWorkload();
}

function updateFacultyWorkload() {
    const workloadCard = document.getElementById('faculty-workload-card');
    const workloadList = document.getElementById('faculty-workload-list');
    
    if (faculty.length === 0) {
        workloadCard.style.display = 'none';
        return;
    }
    
    workloadCard.style.display = 'block';
    workloadList.innerHTML = '';
    
    faculty.forEach(member => {
        const workloadItem = document.createElement('div');
        workloadItem.className = 'workload-item';
        workloadItem.innerHTML = `
            <div class="workload-info">
                <h4>${member.name}</h4>
                <p>${member.department}</p>
            </div>
            <div class="workload-hours">
                <p>${member.workload} hrs</p>
                <p>per week</p>
            </div>
        `;
        workloadList.appendChild(workloadItem);
    });
}

// Faculty Management Functions
function initFacultyManagement() {
    const form = document.getElementById('faculty-form');
    form.addEventListener('submit', addFaculty);
}

function addFaculty(event) {
    event.preventDefault();
    
    const id = document.getElementById('faculty-id').value.trim();
    const name = document.getElementById('faculty-name').value.trim();
    const department = document.getElementById('faculty-department').value.trim();
    
    if (!id || !name || !department) {
        showToast('Error', 'Please fill in all fields', 'error');
        return;
    }
    
    if (faculty.find(f => f.id === id)) {
        showToast('Error', 'Faculty ID already exists', 'error');
        return;
    }
    
    faculty.push({
        id,
        name,
        department,
        workload: 0
    });
    
    saveToStorage();
    updateFacultyList();
    
    // Reset form
    document.getElementById('faculty-form').reset();
    
    showToast('Success', 'Faculty member added successfully');
}

function updateFacultyList() {
    const container = document.getElementById('faculty-list-container');
    
    if (faculty.length === 0) {
        container.innerHTML = '<div class="empty-state">No faculty members added yet. Add your first faculty member above.</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Workload</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${faculty.map(member => `
                <tr>
                    <td><strong>${member.id}</strong></td>
                    <td>${member.name}</td>
                    <td>${member.department}</td>
                    <td>${member.workload} hrs</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-small" onclick="editFaculty('${member.id}')">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-destructive btn-small" onclick="deleteFaculty('${member.id}')">
                                🗑️ Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

function editFaculty(id) {
    const member = faculty.find(f => f.id === id);
    if (!member) return;
    
    const newName = prompt('Enter new name:', member.name);
    const newDepartment = prompt('Enter new department:', member.department);
    
    if (newName && newDepartment) {
        member.name = newName.trim();
        member.department = newDepartment.trim();
        saveToStorage();
        updateFacultyList();
        updateDashboard();
        showToast('Success', 'Faculty member updated successfully');
    }
}

function deleteFaculty(id) {
    if (confirm('Are you sure you want to delete this faculty member?')) {
        faculty = faculty.filter(f => f.id !== id);
        
        // Remove from timetable assignments
        timetable = timetable.filter(slot => slot.facultyId !== id);
        
        saveToStorage();
        updateFacultyList();
        updateDashboard();
        showToast('Success', 'Faculty member deleted successfully');
    }
}

// Subject Management Functions
function initSubjectManagement() {
    const form = document.getElementById('subject-form');
    form.addEventListener('submit', addSubject);
}

function addSubject(event) {
    event.preventDefault();
    
    const code = document.getElementById('subject-code').value.trim();
    const name = document.getElementById('subject-name').value.trim();
    const hoursPerWeek = parseInt(document.getElementById('subject-hours').value);
    
    if (!code || !name || !hoursPerWeek) {
        showToast('Error', 'Please fill in all fields', 'error');
        return;
    }
    
    if (hoursPerWeek <= 0) {
        showToast('Error', 'Hours per week must be a positive number', 'error');
        return;
    }
    
    if (subjects.find(s => s.code === code)) {
        showToast('Error', 'Subject code already exists', 'error');
        return;
    }
    
    subjects.push({
        code,
        name,
        hoursPerWeek,
        assignedHours: 0
    });
    
    saveToStorage();
    updateSubjectList();
    
    // Reset form
    document.getElementById('subject-form').reset();
    
    showToast('Success', 'Subject added successfully');
}

function updateSubjectList() {
    const container = document.getElementById('subject-list-container');
    
    if (subjects.length === 0) {
        container.innerHTML = '<div class="empty-state">No subjects added yet. Add your first subject above.</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Hours/Week</th>
                <th>Assigned</th>
                <th>Progress</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${subjects.map(subject => {
                const progress = subject.hoursPerWeek > 0 ? (subject.assignedHours / subject.hoursPerWeek) * 100 : 0;
                const isComplete = subject.assignedHours >= subject.hoursPerWeek;
                const isOverassigned = subject.assignedHours > subject.hoursPerWeek;
                let progressClass = 'success';
                if (isOverassigned) progressClass = 'error';
                else if (!isComplete) progressClass = 'warning';
                
                return `
                    <tr>
                        <td><strong>${subject.code}</strong></td>
                        <td>${subject.name}</td>
                        <td>${subject.hoursPerWeek}</td>
                        <td>
                            <span style="color: ${isOverassigned ? 'var(--destructive)' : isComplete ? 'var(--success)' : 'var(--foreground)'}">
                                <strong>${subject.assignedHours}</strong>
                            </span>
                        </td>
                        <td>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill ${progressClass}" style="width: ${Math.min(progress, 100)}%"></div>
                                </div>
                                <span class="progress-text">${progress.toFixed(0)}%</span>
                            </div>
                        </td>
                        <td>
                            <button class="btn btn-destructive btn-small" onclick="deleteSubject('${subject.code}')">
                                🗑️ Delete
                            </button>
                        </td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

function deleteSubject(code) {
    if (confirm('Are you sure you want to delete this subject?')) {
        subjects = subjects.filter(s => s.code !== code);
        
        // Remove from timetable assignments
        timetable = timetable.filter(slot => slot.subjectCode !== code);
        
        saveToStorage();
        updateSubjectList();
        updateDashboard();
        showToast('Success', 'Subject deleted successfully');
    }
}

// Timetable Management Functions
function initTimetableManagement() {
    const form = document.getElementById('timetable-form');
    form.addEventListener('submit', assignClass);
    
    updateTimetableDropdowns();
    updateTimetableGrid();
}

function updateTimetableDropdowns() {
    // Update faculty dropdown
    const facultySelect = document.getElementById('assign-faculty');
    facultySelect.innerHTML = '<option value="">Select faculty</option>';
    faculty.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.department})`;
        facultySelect.appendChild(option);
    });
    
    // Update subject dropdown
    const subjectSelect = document.getElementById('assign-subject');
    subjectSelect.innerHTML = '<option value="">Select subject</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.code;
        option.textContent = `${subject.code} - ${subject.name} (${subject.assignedHours}/${subject.hoursPerWeek} hrs)`;
        option.disabled = subject.assignedHours >= subject.hoursPerWeek;
        subjectSelect.appendChild(option);
    });
}

function assignClass(event) {
    event.preventDefault();
    
    const day = document.getElementById('assign-day').value;
    const time = document.getElementById('assign-time').value;
    const facultyId = document.getElementById('assign-faculty').value;
    const subjectCode = document.getElementById('assign-subject').value;
    const room = document.getElementById('assign-room').value.trim();
    
    if (!day || !time || !facultyId || !subjectCode || !room) {
        showToast('Error', 'Please fill in all fields', 'error');
        return;
    }
    
    // Check for existing slot conflict
    const existingSlot = timetable.find(
        slot => slot.day === day && slot.time === time && slot.facultyId
    );
    
    if (existingSlot) {
        showToast('Conflict!', `${existingSlot.facultyName} is already assigned at ${day} ${time}`, 'error');
        return;
    }
    
    // Check faculty conflict at this time
    const facultyConflict = timetable.find(
        slot => slot.facultyId === facultyId && slot.day === day && slot.time === time
    );
    
    if (facultyConflict) {
        showToast('Faculty Conflict!', 'Faculty is already assigned at this time slot', 'error');
        return;
    }
    
    const selectedFaculty = faculty.find(f => f.id === facultyId);
    const selectedSubject = subjects.find(s => s.code === subjectCode);
    
    if (!selectedFaculty || !selectedSubject) return;
    
    // Check subject hours limit
    if (selectedSubject.assignedHours >= selectedSubject.hoursPerWeek) {
        showToast('Subject Hours Exceeded!', `${selectedSubject.name} already has maximum assigned hours (${selectedSubject.hoursPerWeek})`, 'error');
        return;
    }
    
    // Remove any existing slot at this time
    timetable = timetable.filter(slot => !(slot.day === day && slot.time === time));
    
    // Add new assignment
    timetable.push({
        day,
        time,
        facultyId,
        facultyName: selectedFaculty.name,
        subjectCode,
        subjectName: selectedSubject.name,
        room
    });
    
    // Update faculty workload
    selectedFaculty.workload += 1;
    
    // Update subject assigned hours
    selectedSubject.assignedHours += 1;
    
    saveToStorage();
    updateTimetableGrid();
    updateTimetableDropdowns();
    
    // Reset form
    document.getElementById('timetable-form').reset();
    
    showToast('Success', 'Class assigned successfully');
}

function updateTimetableGrid() {
    DAYS.forEach(day => {
        TIMES.forEach(time => {
            const cell = document.querySelector(`[data-day="${day}"][data-time="${time}"]`);
            const slot = timetable.find(s => s.day === day && s.time === time);
            
            if (slot && slot.facultyId) {
                cell.innerHTML = `
                    <div class="timetable-slot">
                        <div class="slot-subject">${slot.subjectCode}</div>
                        <div class="slot-faculty">${slot.facultyName}</div>
                        <div class="slot-room">${slot.room}</div>
                        <button class="remove-btn" onclick="removeAssignment('${day}', '${time}')">×</button>
                    </div>
                `;
            } else {
                cell.innerHTML = '<div class="free-slot">Free</div>';
            }
        });
    });
}

function removeAssignment(day, time) {
    const slotToRemove = timetable.find(slot => slot.day === day && slot.time === time);
    if (!slotToRemove || !slotToRemove.facultyId) return;
    
    // Remove from timetable
    timetable = timetable.filter(slot => !(slot.day === day && slot.time === time));
    
    // Update faculty workload
    const faculty_member = faculty.find(f => f.id === slotToRemove.facultyId);
    if (faculty_member) {
        faculty_member.workload = Math.max(0, faculty_member.workload - 1);
    }
    
    // Update subject assigned hours
    const subject = subjects.find(s => s.code === slotToRemove.subjectCode);
    if (subject) {
        subject.assignedHours = Math.max(0, subject.assignedHours - 1);
    }
    
    saveToStorage();
    updateTimetableGrid();
    updateTimetableDropdowns();
    updateDashboard();
    
    showToast('Success', 'Assignment removed successfully');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initTabNavigation();
    initFacultyManagement();
    initSubjectManagement();
    initTimetableManagement();
    
    // Load initial dashboard data
    updateDashboard();
});

// Make functions globally available
window.editFaculty = editFaculty;
window.deleteFaculty = deleteFaculty;
window.deleteSubject = deleteSubject;
window.removeAssignment = removeAssignment;