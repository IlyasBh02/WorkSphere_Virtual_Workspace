/* Custom styles to complement Tailwind */

:root {
    --primary-color: #3b82f6;
    --secondary-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.modal-content {
    background-color: white;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 2rem;
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #f3f4f6;
}

/* Form Styles */
.form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.photo-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 0.75rem;
    background-color: #f3f4f6;
    display: none;
    border: 3px solid #e5e7eb;
}

/* Button Styles */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: #2563eb;
}

.btn-secondary {
    background-color: #6b7280;
    color: white;
}

.btn-secondary:hover {
    background-color: #4b5563;
}

/* Staff Card Styles */
.staff-card {
    background-color: white;
    border-radius: 8px;
    padding: 0.75rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid #e5e7eb;
    margin-bottom: 0.5rem;
}

.staff-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.staff-photo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 0.75rem;
    background-color: #e5e7eb;
}

.staff-info {
    flex: 1;
}

.staff-name {
    font-weight: 600;
    font-size: 0.875rem;
    margin-bottom: 0.125rem;
}

.staff-role {
    font-size: 0.75rem;
    color: #6b7280;
}

.remove-btn {
    background-color: var(--danger-color);
    color: white;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.75rem;
    transition: background-color 0.2s;
}

.remove-btn:hover {
    background-color: #dc2626;
}

/* Zone Styles with Background Image */
.zone {
    background-color: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s;
    border: 2px solid transparent;
    min-height: 200px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.zone::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    z-index: 1;
}

.zone > * {
    position: relative;
    z-index: 2;
}

.zone.required-empty {
    border-color: var(--danger-color);
    background-color: rgba(239, 68, 68, 0.05);
}

.zone-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
}

.zone-title {
    font-weight: 600;
    font-size: 1.125rem;
}

.zone-capacity {
    font-size: 0.75rem;
    color: #6b7280;
    background: rgba(255, 255, 255, 0.8);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
}

.zone-staff {
    flex: 1;
    min-height: 120px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-content: flex-start;
}

.add-to-zone-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.25rem;
    transition: all 0.2s;
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    z-index: 3;
}

.add-to-zone-btn:hover {
    background-color: #2563eb;
    transform: scale(1.1);
}

/* Profile Styles */
.profile-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.profile-photo {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1.25rem;
    background-color: #f3f4f6;
    border: 4px solid #e5e7eb;
}

.profile-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.profile-role {
    font-size: 1.125rem;
    color: var(--primary-color);
    margin-bottom: 1.25rem;
    font-weight: 500;
}

.profile-details {
    width: 100%;
    text-align: left;
    margin-top: 1.25rem;
}

.profile-detail {
    margin-bottom: 0.75rem;
    display: flex;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;
}

.detail-label {
    font-weight: 600;
    width: 120px;
    color: #374151;
}

.profile-experiences {
    margin-top: 1.5rem;
    width: 100%;
}

.profile-experiences h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #374151;
}

.experience-list {
    list-style-type: none;
    background: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
}

.experience-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #e5e7eb;
    position: relative;
    padding-left: 1rem;
}

.experience-list li:before {
    content: '•';
    color: var(--primary-color);
    position: absolute;
    left: 0;
}

.experience-list li:last-child {
    border-bottom: none;
}

/* Drag and Drop Styles */
.staff-card.dragging {
    opacity: 0.5;
    transform: scale(0.95);
}

.zone.drop-zone, .unassigned-staff.drop-zone {
    border: 2px dashed var(--primary-color);
    background-color: rgba(59, 130, 246, 0.05);
}

.unassigned-staff.drop-zone {
    background-color: rgba(59, 130, 246, 0.05);
}

/* Animation for staff cards */
@keyframes fadeIn {
    from { 
        opacity: 0; 
        transform: translateY(10px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

.staff-card {
    animation: fadeIn 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .modal-content {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .zone-staff .staff-card {
        width: 100%;
    }
}

/* Empty state styling */
.empty-state {
    text-align: center;
    color: #6b7280;
    padding: 2rem;
    font-style: italic;
}