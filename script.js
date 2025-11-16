// Application state
const state = {
    employees: [],
    zones: [
        { 
            id: 'conference', 
            name: 'Salle de conférence', 
            capacity: 10, 
            required: false,
            bgImage: 'url("assets/plan.jpeg")' // Your room image as background
        },
        { 
            id: 'reception', 
            name: 'Réception', 
            capacity: 2, 
            required: true,
            bgImage: 'url("assets/plan.jpeg")'
        },
        { 
            id: 'server', 
            name: 'Salle des serveurs', 
            capacity: 3, 
            required: true,
            bgImage: 'url("assets/plan.jpeg")'
        },
        { 
            id: 'security', 
            name: 'Salle de sécurité', 
            capacity: 2, 
            required: true,
            bgImage: 'url("assets/plan.jpeg")'
        },
        { 
            id: 'staff', 
            name: 'Salle du personnel', 
            capacity: 8, 
            required: false,
            bgImage: 'url("assets/plan.jpeg")'
        },
        { 
            id: 'archives', 
            name: 'Salle d\'archives', 
            capacity: 2, 
            required: true,
            bgImage: 'url("assets/plan.jpeg")'
        }
    ],
    currentZone: null
};

// Role restrictions
const roleRestrictions = {
    receptionist: ['reception'],
    technician: ['server'],
    security: ['security'],
    manager: ['conference', 'reception', 'server', 'security', 'staff', 'archives'],
    cleaning: ['conference', 'reception', 'server', 'security', 'staff'],
    other: ['conference', 'staff']
};

// DOM Elements
const unassignedStaffEl = document.getElementById('unassignedStaff');
const floorPlanEl = document.getElementById('floorPlan');
const addEmployeeModal = document.getElementById('addEmployeeModal');
const employeeProfileModal = document.getElementById('employeeProfileModal');
const assignToZoneModal = document.getElementById('assignToZoneModal');
const addWorkerBtn = document.getElementById('addWorkerBtn');
const closeAddModal = document.getElementById('closeAddModal');
const cancelAddEmployee = document.getElementById('cancelAddEmployee');
const saveEmployee = document.getElementById('saveEmployee');
const closeProfileModal = document.getElementById('closeProfileModal');
const closeProfile = document.getElementById('closeProfile');
const closeAssignModal = document.getElementById('closeAssignModal');
const cancelAssign = document.getElementById('cancelAssign');
const employeeForm = document.getElementById('employeeForm');
const employeePhoto = document.getElementById('employeePhoto');
const photoPreview = document.getElementById('photoPreview');
const addExperienceBtn = document.getElementById('addExperienceBtn');
const experiencesContainer = document.getElementById('experiencesContainer');
const eligibleStaffList = document.getElementById('eligibleStaffList');

// Initialize the application
function init() {
    renderFloorPlan();
    renderUnassignedStaff();
    setupEventListeners();
    loadFromLocalStorage();
}

// Render the floor plan with zones
function renderFloorPlan() {
    floorPlanEl.innerHTML = '';
    
    state.zones.forEach(zone => {
        const zoneEl = document.createElement('div');
        zoneEl.className = `zone ${zone.required && getZoneEmployees(zone.id).length === 0 ? 'required-empty' : ''}`;
        zoneEl.id = `zone-${zone.id}`;
        zoneEl.dataset.zoneId = zone.id;
        zoneEl.style.backgroundImage = zone.bgImage;
        
        const employeesInZone = getZoneEmployees(zone.id);
        
        zoneEl.innerHTML = `
            <div class="zone-header">
                <div class="zone-title">${zone.name}</div>
                <div class="zone-capacity">${employeesInZone.length}/${zone.capacity}</div>
            </div>
            <div class="zone-staff" id="staff-${zone.id}">
                ${employeesInZone.map(employee => createStaffCardHTML(employee)).join('')}
            </div>
            <button class="add-to-zone-btn" data-zone="${zone.id}" title="Ajouter un employé à cette zone">+</button>
        `;
        
        floorPlanEl.appendChild(zoneEl);
    });
    
    // Add event listeners to zone buttons
    document.querySelectorAll('.add-to-zone-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const zoneId = e.target.dataset.zone;
            openAssignToZoneModal(zoneId);
        });
    });
    
    // Setup drag and drop
    setupDragAndDrop();
}

// Render unassigned staff
function renderUnassignedStaff() {
    const unassigned = state.employees.filter(emp => !emp.assignedZone);
    
    if (unassigned.length === 0) {
        unassignedStaffEl.innerHTML = '<p class="empty-state">Aucun employé non assigné</p>';
        return;
    }
    
    unassignedStaffEl.innerHTML = `
        <div class="space-y-2">
            ${unassigned.map(employee => createStaffCardHTML(employee)).join('')}
        </div>
    `;
    
    // Add event listeners to staff cards
    document.querySelectorAll('#unassignedStaff .staff-card').forEach(card => {
        const employeeId = card.dataset.employeeId;
        card.addEventListener('click', () => openEmployeeProfile(employeeId));
        
        // Add remove button event
        const removeBtn = card.querySelector('.remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeEmployee(employeeId);
            });
        }
    });
}

// Create HTML for a staff card
function createStaffCardHTML(employee) {
    return `
        <div class="staff-card" data-employee-id="${employee.id}" draggable="true">
            <img src="${employee.photo || 'assets/default-avatar.png'}" alt="${employee.name}" class="staff-photo" onerror="this.src='assets/default-avatar.png'">
            <div class="staff-info">
                <div class="staff-name">${employee.name}</div>
                <div class="staff-role">${getRoleDisplayName(employee.role)}</div>
            </div>
            <button class="remove-btn" title="Supprimer">×</button>
        </div>
    `;
}

// Get employees in a specific zone
function getZoneEmployees(zoneId) {
    return state.employees.filter(emp => emp.assignedZone === zoneId);
}

// Get display name for role
function getRoleDisplayName(role) {
    const roleNames = {
        manager: 'Manager',
        receptionist: 'Réceptionniste',
        technician: 'Technicien IT',
        security: 'Agent de sécurité',
        cleaning: 'Nettoyage',
        other: 'Autre'
    };
    
    return roleNames[role] || role;
}

// Setup event listeners
function setupEventListeners() {
    // Modal controls
    addWorkerBtn.addEventListener('click', () => openAddEmployeeModal());
    closeAddModal.addEventListener('click', () => closeAddEmployeeModal());
    cancelAddEmployee.addEventListener('click', () => closeAddEmployeeModal());
    saveEmployee.addEventListener('click', () => saveNewEmployee());
    
    closeProfileModal.addEventListener('click', () => closeEmployeeProfile());
    closeProfile.addEventListener('click', () => closeEmployeeProfile());
    
    closeAssignModal.addEventListener('click', () => closeAssignToZoneModal());
    cancelAssign.addEventListener('click', () => closeAssignToZoneModal());
    
    // Photo preview
    employeePhoto.addEventListener('input', () => {
        const url = employeePhoto.value;
        if (url) {
            photoPreview.src = url;
            photoPreview.style.display = 'block';
        } else {
            photoPreview.style.display = 'none';
        }
    });
    
    // Add experience field
    addExperienceBtn.addEventListener('click', addExperienceField);
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (addEmployeeModal.style.display === 'flex') closeAddEmployeeModal();
            if (employeeProfileModal.style.display === 'flex') closeEmployeeProfile();
            if (assignToZoneModal.style.display === 'flex') closeAssignToZoneModal();
        }
    });
}

// Open add employee modal
function openAddEmployeeModal() {
    addEmployeeModal.style.display = 'flex';
    employeeForm.reset();
    photoPreview.style.display = 'none';
    
    // Reset experiences to one field
    experiencesContainer.innerHTML = `
        <div class="experience-item flex gap-2 mb-2">
            <input type="text" class="form-control experience-input flex-1" placeholder="Description de l'expérience">
            <button type="button" class="remove-experience-btn bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-200">&times;</button>
        </div>
    `;
    
    // Add event listener to the remove button
    const removeBtn = experiencesContainer.querySelector('.remove-experience-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', removeExperienceField);
    }
}

// Close add employee modal
function closeAddEmployeeModal() {
    addEmployeeModal.style.display = 'none';
}

// Save new employee
function saveNewEmployee() {
    const name = document.getElementById('employeeName').value;
    const role = document.getElementById('employeeRole').value;
    const photo = document.getElementById('employeePhoto').value;
    const email = document.getElementById('employeeEmail').value;
    const phone = document.getElementById('employeePhone').value;
    
    if (!name || !role || !email || !phone) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Get experiences
    const experienceInputs = document.querySelectorAll('.experience-input');
    const experiences = Array.from(experienceInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '');
    
    const newEmployee = {
        id: generateId(),
        name,
        role,
        photo: photo || null,
        email,
        phone,
        experiences,
        assignedZone: null
    };
    
    state.employees.push(newEmployee);
    saveToLocalStorage();
    renderUnassignedStaff();
    closeAddEmployeeModal();
}

// Open employee profile
function openEmployeeProfile(employeeId) {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const profileContent = document.getElementById('profileContent');
    const currentZone = employee.assignedZone 
        ? state.zones.find(zone => zone.id === employee.assignedZone)?.name 
        : 'Non assigné';
    
    profileContent.innerHTML = `
        <img src="${employee.photo || 'assets/default-avatar.png'}" alt="${employee.name}" class="profile-photo" onerror="this.src='assets/default-avatar.png'">
        <div class="profile-name">${employee.name}</div>
        <div class="profile-role">${getRoleDisplayName(employee.role)}</div>
        
        <div class="profile-details">
            <div class="profile-detail">
                <span class="detail-label">Email:</span>
                <span>${employee.email}</span>
            </div>
            <div class="profile-detail">
                <span class="detail-label">Téléphone:</span>
                <span>${employee.phone}</span>
            </div>
            <div class="profile-detail">
                <span class="detail-label">Localisation:</span>
                <span>${currentZone}</span>
            </div>
            
            ${employee.experiences.length > 0 ? `
            <div class="profile-experiences">
                <h3>Expériences professionnelles</h3>
                <ul class="experience-list">
                    ${employee.experiences.map(exp => `<li>${exp}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;
    
    employeeProfileModal.style.display = 'flex';
}

// Close employee profile
function closeEmployeeProfile() {
    employeeProfileModal.style.display = 'none';
}

// Open assign to zone modal
function openAssignToZoneModal(zoneId) {
    state.currentZone = zoneId;
    const zone = state.zones.find(z => z.id === zoneId);
    const currentEmployees = getZoneEmployees(zoneId).length;
    
    if (currentEmployees >= zone.capacity) {
        alert(`Cette zone est déjà pleine (${zone.capacity} employés maximum)`);
        return;
    }
    
    // Get eligible employees for this zone
    const eligibleEmployees = state.employees.filter(emp => 
        !emp.assignedZone && isEmployeeEligibleForZone(emp, zoneId)
    );
    
    if (eligibleEmployees.length === 0) {
        alert('Aucun employé éligible pour cette zone');
        return;
    }
    
    eligibleStaffList.innerHTML = `
        <div class="space-y-3">
            ${eligibleEmployees.map(employee => `
                <div class="staff-card cursor-pointer hover:bg-blue-50 transition duration-200" data-employee-id="${employee.id}">
                    <img src="${employee.photo || 'assets/default-avatar.png'}" alt="${employee.name}" class="staff-photo" onerror="this.src='assets/default-avatar.png'">
                    <div class="staff-info">
                        <div class="staff-name">${employee.name}</div>
                        <div class="staff-role">${getRoleDisplayName(employee.role)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add event listeners to eligible staff cards
    document.querySelectorAll('#eligibleStaffList .staff-card').forEach(card => {
        card.addEventListener('click', () => {
            const employeeId = card.dataset.employeeId;
            assignEmployeeToZone(employeeId, zoneId);
            closeAssignToZoneModal();
        });
    });
    
    assignToZoneModal.style.display = 'flex';
}

// Close assign to zone modal
function closeAssignToZoneModal() {
    assignToZoneModal.style.display = 'none';
    state.currentZone = null;
}

// Check if employee is eligible for a zone
function isEmployeeEligibleForZone(employee, zoneId) {
    const allowedZones = roleRestrictions[employee.role] || [];
    
    // Managers and cleaning staff have special rules
    if (employee.role === 'manager') return true;
    if (employee.role === 'cleaning' && zoneId === 'archives') return false;
    
    return allowedZones.includes(zoneId) || 
           (employee.role === 'other' && (zoneId === 'conference' || zoneId === 'staff'));
}

// Assign employee to zone
function assignEmployeeToZone(employeeId, zoneId) {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const zone = state.zones.find(z => z.id === zoneId);
    const currentEmployees = getZoneEmployees(zoneId).length;
    
    if (currentEmployees >= zone.capacity) {
        alert(`Cette zone est déjà pleine (${zone.capacity} employés maximum)`);
        return;
    }
    
    if (!isEmployeeEligibleForZone(employee, zoneId)) {
        alert(`Cet employé n'est pas autorisé dans cette zone`);
        return;
    }
    
    employee.assignedZone = zoneId;
    saveToLocalStorage();
    renderFloorPlan();
    renderUnassignedStaff();
}

// Remove employee from zone (unassign)
function removeEmployeeFromZone(employeeId) {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    employee.assignedZone = null;
    saveToLocalStorage();
    renderFloorPlan();
    renderUnassignedStaff();
}

// Remove employee completely
function removeEmployee(employeeId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
        state.employees = state.employees.filter(emp => emp.id !== employeeId);
        saveToLocalStorage();
        renderFloorPlan();
        renderUnassignedStaff();
    }
}

// Add experience field
function addExperienceField() {
    const experienceItem = document.createElement('div');
    experienceItem.className = 'experience-item flex gap-2 mb-2';
    experienceItem.innerHTML = `
        <input type="text" class="form-control experience-input flex-1" placeholder="Description de l'expérience">
        <button type="button" class="remove-experience-btn bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-200">&times;</button>
    `;
    
    experiencesContainer.appendChild(experienceItem);
    
    // Add event listener to the remove button
    const removeBtn = experienceItem.querySelector('.remove-experience-btn');
    removeBtn.addEventListener('click', removeExperienceField);
}

// Remove experience field
function removeExperienceField(e) {
    // Don't remove if it's the last field
    if (