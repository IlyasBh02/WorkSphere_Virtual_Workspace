// Application state
const state = {
    employees: [],
    zones: [
        {
            id: 'conference',
            name: 'Salle de conférence',
            capacity: 10,
            required: false,
            position: { top: '20%', left: '15%', width: '25%', height: '30%' },
            allowedRoles: ['manager', 'receptionist', 'technician', 'security', 'cleaning', 'other']
        },
        {
            id: 'reception',
            name: 'Réception',
            capacity: 2,
            required: true,
            position: { top: '10%', left: '60%', width: '15%', height: '20%' },
            allowedRoles: ['manager', 'receptionist']
        },
        {
            id: 'server',
            name: 'Salle des serveurs',
            capacity: 3,
            required: true,
            position: { top: '40%', left: '70%', width: '20%', height: '25%' },
            allowedRoles: ['manager', 'technician']
        },
        {
            id: 'security',
            name: 'Salle de sécurité',
            capacity: 2,
            required: true,
            position: { top: '60%', left: '20%', width: '15%', height: '20%' },
            allowedRoles: ['manager', 'security']
        },
        {
            id: 'staff',
            name: 'Salle du personnel',
            capacity: 8,
            required: false,
            position: { top: '50%', left: '45%', width: '20%', height: '25%' },
            allowedRoles: ['manager', 'receptionist', 'technician', 'security', 'cleaning', 'other']
        },
        {
            id: 'archives',
            name: 'Salle d\'archives',
            capacity: 2,
            required: true,
            position: { top: '75%', left: '65%', width: '15%', height: '15%' },
            allowedRoles: ['manager', 'receptionist', 'technician', 'security', 'other']
        }
    ],
    currentZone: null
};

// DOM Elements
const unassignedStaffEl = document.getElementById('unassignedStaff');
const floorPlanEl = document.getElementById('floorPlan');
const zoneOverlaysEl = document.querySelector('.zone-overlays');
const addEmployeeModal = document.getElementById('addEmployeeModal');
const employeeProfileModal = document.getElementById('employeeProfileModal');
const addWorkerBtn = document.getElementById('addWorkerBtn');
const closeAddModal = document.getElementById('closeAddModal');
const cancelAddEmployee = document.getElementById('cancelAddEmployee');
const saveEmployee = document.getElementById('saveEmployee');
const closeProfileModal = document.getElementById('closeProfileModal');
const closeProfile = document.getElementById('closeProfile');
const employeeForm = document.getElementById('employeeForm');
const employeePhoto = document.getElementById('employeePhoto');
const photoPreview = document.getElementById('photoPreview');
const addExperienceBtn = document.getElementById('addExperienceBtn');
const experiencesContainer = document.getElementById('experiencesContainer');

// Initialize the application
function init() {
    renderZoneOverlays();
    renderFloorPlan();
    renderUnassignedStaff();
    setupEventListeners();
    loadFromLocalStorage();
}

// Render zone overlays on the floor plan
function renderZoneOverlays() {
    zoneOverlaysEl.innerHTML = '';
    
    state.zones.forEach(zone => {
        const overlay = document.createElement('div');
        overlay.className = `zone-overlay ${zone.required && getZoneEmployees(zone.id).length === 0 ? 'required-empty' : ''}`;
        overlay.dataset.zoneId = zone.id;
        overlay.style.top = zone.position.top;
        overlay.style.left = zone.position.left;
        overlay.style.width = zone.position.width;
        overlay.style.height = zone.position.height;
        
        overlay.title = `${zone.name} (${getZoneEmployees(zone.id).length}/${zone.capacity})`;
        
        zoneOverlaysEl.appendChild(overlay);
    });
    
    setupZoneEventListeners();
}

// Render employees on the floor plan
function renderFloorPlan() {
    floorPlanEl.innerHTML = '';
    
    state.employees.forEach(employee => {
        if (employee.assignedZone) {
            const zone = state.zones.find(z => z.id === employee.assignedZone);
            if (zone) {
                createEmployeeMarker(employee, zone);
            }
        }
    });
}

// Create employee marker on the floor plan
function createEmployeeMarker(employee, zone) {
    const marker = document.createElement('div');
    marker.className = `employee-marker ${employee.role}`;
    marker.dataset.employeeId = employee.id;
    
    // Position aléatoire dans la zone
    const zoneRect = {
        top: parseFloat(zone.position.top),
        left: parseFloat(zone.position.left),
        width: parseFloat(zone.position.width),
        height: parseFloat(zone.position.height)
    };
    
    const randomTop = zoneRect.top + Math.random() * (zoneRect.height - 10);
    const randomLeft = zoneRect.left + Math.random() * (zoneRect.width - 10);
    
    marker.style.top = `${randomTop}%`;
    marker.style.left = `${randomLeft}%`;
    
    // Initiales pour l'affichage
    const initials = employee.name.split(' ').map(n => n[0]).join('').toUpperCase();
    marker.innerHTML = `<div class="initials">${initials}</div>`;
    
    marker.title = `${employee.name} - ${getRoleDisplayName(employee.role)}`;
    
    // Event listeners
    marker.addEventListener('click', (e) => {
        e.stopPropagation();
        openEmployeeProfile(employee.id);
    });
    
    marker.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        removeEmployeeFromZone(employee.id);
    });
    
    // Drag and drop
    marker.setAttribute('draggable', 'true');
    marker.addEventListener('dragstart', handleDragStart);
    marker.addEventListener('dragend', handleDragEnd);
    
    floorPlanEl.appendChild(marker);
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
        
        const removeBtn = card.querySelector('.remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeEmployee(employeeId);
            });
        }
        
        // Drag and drop
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
}

// Create HTML for a staff card in sidebar
function createStaffCardHTML(employee) {
    const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFOUU5RTkiLz4KPHBhdGggZD0iTTIwIDIyQzIyLjIwOTEgMjIgMjQgMjAuMjA5MSAyNCAxOEMyNCAxNS43OTA5IDIyLjIwOTEgMTQgMjAgMTRDMTcuNzkwOSAxNCAxNiAxNS43OTA5IDE2IDE4QzE2IDIwLjIwOTEgMTcuNzkwOSAyMiAyMCAyMloiIGZpbGw9IiNCOEI4QjgiLz4KPHBhdGggZD0iTTIwIDI0QzE1LjU4IDI0IDEyIDI2LjIzIDEyIDI5VjMxQzEyIDMxLjU1MjMgMTIuNDQ3NyAzMiAxMyAzMkgyN0MyNy41NTIzIDMyIDI4IDMxLjU1MjMgMjggMzFWMjlDMjggMjYuMjMgMjQuNDIgMjQgMjAgMjRaIiBmaWxsPSIjQjhCOEI4Ii8+Cjwvc3ZnPgo=';
    
    return `
        <div class="staff-card" data-employee-id="${employee.id}">
            <img src="${employee.photo || defaultAvatar}" alt="${employee.name}" class="staff-photo">
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
    addWorkerBtn.addEventListener('click', () => openAddEmployeeModal());
    closeAddModal.addEventListener('click', () => closeAddEmployeeModal());
    cancelAddEmployee.addEventListener('click', () => closeAddEmployeeModal());
    saveEmployee.addEventListener('click', () => saveNewEmployee());
    closeProfileModal.addEventListener('click', () => closeEmployeeProfile());
    closeProfile.addEventListener('click', () => closeEmployeeProfile());
    
    employeePhoto.addEventListener('input', () => {
        const url = employeePhoto.value;
        if (url) {
            photoPreview.src = url;
            photoPreview.style.display = 'block';
        } else {
            photoPreview.style.display = 'none';
        }
    });
    
    addExperienceBtn.addEventListener('click', addExperienceField);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (addEmployeeModal.style.display === 'flex') closeAddEmployeeModal();
            if (employeeProfileModal.style.display === 'flex') closeEmployeeProfile();
        }
    });
}

// Setup zone event listeners
function setupZoneEventListeners() {
    document.querySelectorAll('.zone-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const zoneId = e.target.dataset.zoneId;
            const employeesInZone = getZoneEmployees(zoneId);
            const zone = state.zones.find(z => z.id === zoneId);
            
            if (employeesInZone.length > 0) {
                // Afficher les employés de cette zone
                const employeeList = employeesInZone.map(emp => 
                    `• ${emp.name} (${getRoleDisplayName(emp.role)})`
                ).join('\n');
                alert(`${zone.name}:\n${employeeList}`);
            } else {
                alert(`${zone.name} - Aucun employé assigné`);
            }
        });
        
        // Drag and drop
        overlay.addEventListener('dragover', handleDragOver);
        overlay.addEventListener('dragenter', handleDragEnter);
        overlay.addEventListener('dragleave', handleDragLeave);
        overlay.addEventListener('drop', handleDrop);
    });
}

// Open add employee modal
function openAddEmployeeModal() {
    addEmployeeModal.style.display = 'flex';
    employeeForm.reset();
    photoPreview.style.display = 'none';
    
    experiencesContainer.innerHTML = `
        <div class="experience-item flex gap-2 mb-2">
            <input type="text" class="form-control experience-input flex-1" placeholder="Description de l'expérience">
            <button type="button" class="remove-experience-btn bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition duration-200">&times;</button>
        </div>
    `;
    
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
    
    const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9Ijc1IiBmaWxsPSIjRTlFOUU5Ii8+CjxwYXRoIGQ9Ik03NSA4MkM4Mi43MzEgODIgODkgNzguNDE4IDg5IDc0Qzg5IDY5LjU4MiA4Mi43MzEgNjYgNzUgNjZDNjcuMjY5IDY2IDYxIDY5LjU4MiA2MSA3NEM2MSA3OC40MTggNjcuMjY5IDgyIDc1IDgyWiIgZmlsbD0iI0I4QjhCOCIvPgo8cGF0aCBkPSJNNzUgODRDNjAuNjQgODQgNDkgODkuODM2IDQ5IDk3VjEwMkM0OSAxMDIuNTUyIDQ5LjQ0NzcgMTAzIDUwIDEwM0gxMDBDMTAwLjU1MiAxMDMgMTAxIDEwMi41NTIgMTAxIDEwMlY5N0MxMDEgODkuODM2IDg5LjM2IDg0IDc1IDg0WiIgZmlsbD0iI0I4QjhCOCIvPgo8L3N2Zz4K';
    
    profileContent.innerHTML = `
        <img src="${employee.photo || defaultAvatar}" alt="${employee.name}" class="profile-photo">
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

// Remove employee from zone
function removeEmployeeFromZone(employeeId) {
    const employee = state.employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    employee.assignedZone = null;
    saveToLocalStorage();
    renderFloorPlan();
    renderZoneOverlays();
    renderUnassignedStaff();
}

// Remove employee completely
function removeEmployee(employeeId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
        state.employees = state.employees.filter(emp => emp.id !== employeeId);
        saveToLocalStorage();
        renderFloorPlan();
        renderZoneOverlays();
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
    
    const removeBtn = experienceItem.querySelector('.remove-experience-btn');
    removeBtn.addEventListener('click', removeExperienceField);
}

// Remove experience field
function removeExperienceField(e) {
    if (document.querySelectorAll('.experience-item').length > 1) {
        e.target.closest('.experience-item').remove();
    }
}

// Drag and Drop Functions
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.employeeId);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.zone-overlay').forEach(overlay => {
        overlay.classList.remove('drop-zone');
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drop-zone');
}

function handleDragLeave(e) {
    if (!e.target.closest('.zone-overlay')) {
        document.querySelectorAll('.zone-overlay').forEach(overlay => {
            overlay.classList.remove('drop-zone');
        });
    }
}

function handleDrop(e) {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData('text/plain');
    const zoneId = e.target.dataset.zoneId;
    
    assignEmployeeToZone(employeeId, zoneId);
    
    document.querySelectorAll('.zone-overlay').forEach(overlay => {
        overlay.classList.remove('drop-zone');
    });
}

// Assign employee to zone
function assignEmployeeToZone(employeeId, zoneId) {
    const employee = state.employees.find(emp => emp.id === employeeId);
    const zone = state.zones.find(z => z.id === zoneId);
    
    if (!employee || !zone) return;
    
    // Vérifier la capacité
    const currentEmployees = getZoneEmployees(zoneId).length;
    if (currentEmployees >= zone.capacity) {
        alert(`Cette zone est déjà pleine (${zone.capacity} employés maximum)`);
        return;
    }
    
    // Vérifier les permissions
    if (!zone.allowedRoles.includes(employee.role)) {
        alert(`Cet employé (${getRoleDisplayName(employee.role)}) n'est pas autorisé dans la ${zone.name}`);
        return;
    }
    
    employee.assignedZone = zoneId;
    saveToLocalStorage();
    renderFloorPlan();
    renderZoneOverlays();
    renderUnassignedStaff();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('workSphereData', JSON.stringify(state.employees));
}

// Load from localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('workSphereData');
    if (savedData) {
        state.employees = JSON.parse(savedData);
        renderFloorPlan();
        renderZoneOverlays();
        renderUnassignedStaff();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);