        // Application state
        const state = {
            employees: [],
            zones: [
                { id: 'conference', name: 'Salle de conférence', capacity: 10, required: false },
                { id: 'reception', name: 'Réception', capacity: 2, required: true },
                { id: 'server', name: 'Salle des serveurs', capacity: 3, required: true },
                { id: 'security', name: 'Salle de sécurité', capacity: 2, required: true },
                { id: 'staff', name: 'Salle du personnel', capacity: 8, required: false },
                { id: 'archives', name: 'Salle d\'archives', capacity: 2, required: true }
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
                
                const employeesInZone = getZoneEmployees(zone.id);
                
                zoneEl.innerHTML = `
                    <div class="zone-header">
                        <div class="zone-title">${zone.name}</div>
                        <div class="zone-capacity">${employeesInZone.length}/${zone.capacity}</div>
                    </div>
                    <div class="zone-staff" id="staff-${zone.id}">
                        ${employeesInZone.map(employee => createStaffCardHTML(employee)).join('')}
                    </div>
                    <button class="add-to-zone-btn" data-zone="${zone.id}">+</button>
                `;
                
                floorPlanEl.appendChild(zoneEl);
            });
            
            // Add event listeners to zone buttons
            document.querySelectorAll('.add-to-zone-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
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
                unassignedStaffEl.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucun employé non assigné</p>';
                return;
            }
            
            unassignedStaffEl.innerHTML = `
                <div class="staff-list">
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
                    <img src="${employee.photo || 'https://via.placeholder.com/40?text=?'}" alt="${employee.name}" class="staff-photo">
                    <div class="staff-info">
                        <div class="staff-name">${employee.name}</div>
                        <div class="staff-role">${getRoleDisplayName(employee.role)}</div>
                    </div>
                    <button class="remove-btn" title="Retirer">×</button>
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
                <div class="experience-item">
                    <input type="text" class="form-control experience-input" placeholder="Description de l'expérience">
                    <button type="button" class="remove-experience-btn">&times;</button>
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
                <img src="${employee.photo || 'https://via.placeholder.com/150?text=?'}" alt="${employee.name}" class="profile-photo">
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
                <div class="staff-list">
                    ${eligibleEmployees.map(employee => `
                        <div class="staff-card" data-employee-id="${employee.id}">
                            <img src="${employee.photo || 'https://via.placeholder.com/40?text=?'}" alt="${employee.name}" class="staff-photo">
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
            experienceItem.className = 'experience-item';
            experienceItem.innerHTML = `
                <input type="text" class="form-control experience-input" placeholder="Description de l'expérience">
                <button type="button" class="remove-experience-btn">&times;</button>
            `;
            
            experiencesContainer.appendChild(experienceItem);
            
            // Add event listener to the remove button
            const removeBtn = experienceItem.querySelector('.remove-experience-btn');
            removeBtn.addEventListener('click', removeExperienceField);
        }

        // Remove experience field
        function removeExperienceField(e) {
            // Don't remove if it's the last field
            if (document.querySelectorAll('.experience-item').length > 1) {
                e.target.closest('.experience-item').remove();
            }
        }

        // Setup drag and drop functionality
        function setupDragAndDrop() {
            const staffCards = document.querySelectorAll('.staff-card');
            
            staffCards.forEach(card => {
                card.addEventListener('dragstart', handleDragStart);
                card.addEventListener('dragend', handleDragEnd);
            });
            
            const zones = document.querySelectorAll('.zone');
            
            zones.forEach(zone => {
                zone.addEventListener('dragover', handleDragOver);
                zone.addEventListener('dragenter', handleDragEnter);
                zone.addEventListener('dragleave', handleDragLeave);
                zone.addEventListener('drop', handleDrop);
            });
            
            // Also make unassigned area a drop target
            unassignedStaffEl.addEventListener('dragover', handleDragOver);
            unassignedStaffEl.addEventListener('dragenter', handleDragEnter);
            unassignedStaffEl.addEventListener('dragleave', handleDragLeave);
            unassignedStaffEl.addEventListener('drop', handleDropToUnassigned);
        }

        function handleDragStart(e) {
            e.dataTransfer.setData('text/plain', e.target.dataset.employeeId);
            e.target.classList.add('dragging');
            
            // Set drag image to be the card itself
            const dragImage = e.target.cloneNode(true);
            dragImage.style.width = `${e.target.offsetWidth}px`;
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, e.target.offsetWidth / 2, e.target.offsetHeight / 2);
            
            setTimeout(() => {
                document.body.removeChild(dragImage);
            }, 0);
        }

        function handleDragEnd(e) {
            e.target.classList.remove('dragging');
            document.querySelectorAll('.zone, .unassigned-staff').forEach(el => {
                el.classList.remove('drop-zone');
            });
        }

        function handleDragOver(e) {
            e.preventDefault();
        }

        function handleDragEnter(e) {
            e.preventDefault();
            e.target.closest('.zone, .unassigned-staff')?.classList.add('drop-zone');
        }

        function handleDragLeave(e) {
            if (!e.target.closest('.zone, .unassigned-staff')) {
                document.querySelectorAll('.zone, .unassigned-staff').forEach(el => {
                    el.classList.remove('drop-zone');
                });
            }
        }

        function handleDrop(e) {
            e.preventDefault();
            const employeeId = e.dataTransfer.getData('text/plain');
            const zoneEl = e.target.closest('.zone');
            
            if (!zoneEl) return;
            
            const zoneId = zoneEl.dataset.zoneId;
            assignEmployeeToZone(employeeId, zoneId);
            
            document.querySelectorAll('.zone, .unassigned-staff').forEach(el => {
                el.classList.remove('drop-zone');
            });
        }

        function handleDropToUnassigned(e) {
            e.preventDefault();
            const employeeId = e.dataTransfer.getData('text/plain');
            removeEmployeeFromZone(employeeId);
            
            document.querySelectorAll('.zone, .unassigned-staff').forEach(el => {
                el.classList.remove('drop-zone');
            });
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
                renderUnassignedStaff();
                renderFloorPlan();
            }
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', init);
