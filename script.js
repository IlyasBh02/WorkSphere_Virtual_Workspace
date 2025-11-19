// script.js
let workers = [];
let currentRoomForSelection = "";

const roomCapacity = {
  conference: 10,
  reception: 3,
  server: 5,
  security: 4,
  staff: 15,
  archives: 5,
};

const roomRules = {
  reception: ["Réceptionniste"],
  server: ["Technicien IT"],
  security: ["Agent de Sécurité"],
  conference: null,
  staff: null,
  archives: [
    "Réceptionniste",
    "Technicien IT",
    "Agent de Sécurité",
    "Manager",
    "Employé",
  ],
};

// Fetch workers data from JSON file
async function fetchWorkersData() {
  try {
    const response = await fetch("workers.json");
    if (!response.ok) {
      throw new Error("Failed to fetch workers data");
    }
    const data = await response.json();
    workers = data.workers;
    initializeApp();
  } catch (error) {
    console.error("Error loading workers data:", error);
    // Fallback to empty array if fetch fails
    workers = [];
    initializeApp();
  }
}

// Event Listeners Setup
function setupEventListeners() {
  // Add worker button
  document
    .getElementById("addWorkerBtn")
    .addEventListener("click", openAddWorkerModal);

  // Close modal buttons
  document
    .getElementById("closeAddWorkerModal")
    .addEventListener("click", closeAddWorkerModal);
  document
    .getElementById("closeProfileModal")
    .addEventListener("click", closeProfileModal);
  document
    .getElementById("closeSelectWorkerModal")
    .addEventListener("click", closeSelectWorkerModal);

  // Form submission
  document.getElementById("workerForm").addEventListener("submit", addWorker);

  // Photo preview
  document
    .getElementById("workerPhoto")
    .addEventListener("change", previewPhoto);

  // Add experience button
  document
    .getElementById("addExperienceBtn")
    .addEventListener("click", addExperienceField);

  // Add to room buttons
  document.querySelectorAll(".add-to-room-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const room = this.getAttribute("data-room");
      openSelectWorkerModal(room);
    });
  });

  // Close modals on outside click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", function (event) {
      if (event.target === this) {
        this.classList.remove("active");
      }
    });
  });
}

function getRoleClass(role) {
  const roleMap = {
    Réceptionniste: "role-receptionist",
    "Technicien IT": "role-it",
    "Agent de Sécurité": "role-security",
    Manager: "role-manager",
    Nettoyage: "role-cleaning",
  };
  return roleMap[role] || "role-default";
}

function canAssignToRoom(role, room) {
  if (room === "conference" || room === "staff") return true;
  if (room === "archives" && role === "Nettoyage") return false;
  if (roomRules[room]) {
    if (role === "Manager") return true;
    return roomRules[room].includes(role);
  }
  return true;
}

function openAddWorkerModal() {
  document.getElementById("addWorkerModal").classList.add("active");
}

function closeAddWorkerModal() {
  document.getElementById("addWorkerModal").classList.remove("active");
  document.getElementById("workerForm").reset();
  document.getElementById("photoPreview").style.display = "none";
  document.getElementById("experiencesList").innerHTML = "";
}

function previewPhoto() {
  const url = document.getElementById("workerPhoto").value;
  const preview = document.getElementById("photoPreview");
  if (url) {
    preview.src = url;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
}

function addExperienceField() {
  const list = document.getElementById("experiencesList");
  const index = list.children.length;
  const expDiv = document.createElement("div");
  expDiv.className = "experience-item";
  expDiv.innerHTML = `
                <button type="button" class="remove-experience-btn">✕</button>
                <div class="form-group">
                    <label>Poste</label>
                    <input type="text" class="exp-title" placeholder="Ex: Développeur Web">
                </div>
                <div class="form-group">
                    <label>Entreprise</label>
                    <input type="text" class="exp-company" placeholder="Ex: TechCorp">
                </div>
                <div class="form-group">
                    <label>Date de début</label>
                    <input type="date" class="exp-period" placeholder="Ex: 20/11/2025">
                </div>
                <div class="form-group">
                    <label>date de fin</label>
                    <input type="date" class="exp-period" placeholder="Ex: 20/11/2025">
                </div>
            `;
  list.appendChild(expDiv);

  // Add event listener to the new remove button
  expDiv
    .querySelector(".remove-experience-btn")
    .addEventListener("click", function () {
      removeExperience(this);
    });
}
function removeExperience(btn) {
  btn.parentElement.remove();
}

function addWorker(e) {
  e.preventDefault();

  const experiences = [];
  document.querySelectorAll(".experience-item").forEach((item) => {
    const title = item.querySelector(".exp-title").value;
    const company = item.querySelector(".exp-company").value;
    const period = item.querySelector(".exp-period").value;
    if (title || company || period) {
      experiences.push({ title, company, period });
    }
  });

  const worker = {
    id: Date.now(),
    name: document.getElementById("workerName").value,
    role: document.getElementById("workerRole").value,
    photo:
      document.getElementById("workerPhoto").value ||
      "https://via.placeholder.com/150/667eea/ffffff?text=" +
        document.getElementById("workerName").value.charAt(0),
    email: document.getElementById("workerEmail").value,
    phone: document.getElementById("workerPhone").value,
    experiences: experiences,
    room: null,
  };

  workers.push(worker);
  renderUnassigned();
  closeAddWorkerModal();
}

function renderUnassigned() {
  const list = document.getElementById("unassignedList");
  const unassigned = workers.filter((w) => !w.room);

  if (unassigned.length === 0) {
    list.innerHTML = '<div class="empty-state">Aucun employé non assigné</div>';
    return;
  }

  list.innerHTML = unassigned
    .map(
      (w) => `
                <div class="worker-card" data-id="${w.id}">
                    <img src="${w.photo}" alt="${w.name}">
                    <div class="worker-info">
                        <h3>${w.name}</h3>
                        <p>${w.email}</p>
                        <span class="role-badge ${getRoleClass(w.role)}">${
        w.role
      }</span>
                    </div>
                </div>
            `
    )
    .join("");

  // Add event listeners to worker cards
  document.querySelectorAll("#unassignedList .worker-card").forEach((card) => {
    card.addEventListener("click", function () {
      const workerId = parseInt(this.getAttribute("data-id"));
      showProfile(workerId);
    });
  });
}

function renderRoom(room) {
  const container = document.getElementById(`workers-${room}`);
  const roomWorkers = workers.filter((w) => w.room === room);
  const capacity = roomCapacity[room];

  document.getElementById(`cap-${room}`).textContent = roomWorkers.length;
  container.innerHTML = roomWorkers
    .map(
      (w) => `
                <div class="room-worker">
                    <img src="${w.photo}" alt="${w.name}" data-id="${w.id}">
                    <div class="room-worker-info" data-id="${w.id}">
                        <h4>${w.name}</h4>
                        <p>${w.role}</p>
                    </div>
                    <button class="remove-btn" data-id="${w.id}" title="Retirer">✕</button>
                </div>
            `
    )
    .join("");

  // Add event listeners to room worker elements
  document
    .querySelectorAll(
      `#workers-${room} .room-worker img, #workers-${room} .room-worker-info`
    )
    .forEach((element) => {
      element.addEventListener("click", function () {
        const workerId = parseInt(this.getAttribute("data-id"));
        showProfile(workerId);
      });
    });

  // Add event listeners to remove buttons
  document
    .querySelectorAll(`#workers-${room} .remove-btn`)
    .forEach((button) => {
      button.addEventListener("click", function () {
        const workerId = parseInt(this.getAttribute("data-id"));
        removeFromRoom(workerId);
      });
    });

  updateRoomStatus(room);
}

function updateRoomStatus(room) {
  const card = document.getElementById(`room-${room}`);
  const roomWorkers = workers.filter((w) => w.room === room);
  const needsStaff =
    roomRules[room] !== null &&
    roomRules[room] !== undefined &&
    room !== "conference" &&
    room !== "staff";

  if (needsStaff && roomWorkers.length === 0) {
    card.classList.add("required-empty");
  } else {
    card.classList.remove("required-empty");
  }
}

function removeFromRoom(workerId) {
  const worker = workers.find((w) => w.id === workerId);
  if (worker) {
    const oldRoom = worker.room;
    worker.room = null;
    renderUnassigned();
    if (oldRoom) renderRoom(oldRoom);
  }
}

function openSelectWorkerModal(room) {
  currentRoomForSelection = room;
  const eligible = workers.filter(
    (w) => !w.room && canAssignToRoom(w.role, room)
  );
  const list = document.getElementById("workerSelectList");

  const currentCount = workers.filter((w) => w.room === room).length;
  if (currentCount >= roomCapacity[room]) {
    alert("Cette zone a atteint sa capacité maximale");
    return;
  }

  if (eligible.length === 0) {
    list.innerHTML =
      '<div class="empty-state">Aucun employé éligible pour cette zone</div>';
    document.getElementById("selectWorkerModal").classList.add("active");
    return;
  }

  list.innerHTML = eligible
    .map(
      (w) => `
                <div class="worker-card" data-id="${w.id}">
                    <img src="${w.photo}" alt="${w.name}">
                    <div class="worker-info">
                        <h3>${w.name}</h3>
                        <p>${w.email}</p>
                        <span class="role-badge ${getRoleClass(w.role)}">${
        w.role
      }</span>
                    </div>
                </div>
            `
    )
    .join("");

  // Add event listeners to worker cards in selection modal
  document
    .querySelectorAll("#workerSelectList .worker-card")
    .forEach((card) => {
      card.addEventListener("click", function () {
        const workerId = parseInt(this.getAttribute("data-id"));
        assignToRoom(workerId, room);
      });
    });

  document.getElementById("selectWorkerModal").classList.add("active");
}

function closeSelectWorkerModal() {
  document.getElementById("selectWorkerModal").classList.remove("active");
  currentRoomForSelection = "";
}

function assignToRoom(workerId, room) {
  const worker = workers.find((w) => w.id === workerId);
  if (worker) {
    const currentCount = workers.filter((w) => w.room === room).length;
    if (currentCount >= roomCapacity[room]) {
      alert("Cette zone a atteint sa capacité maximale");
      return;
    }

    worker.room = room;
    renderUnassigned();
    renderRoom(room);
    closeSelectWorkerModal();
  }
}

function showProfile(workerId) {
  const worker = workers.find((w) => w.id === workerId);
  if (!worker) return;

  const roomNames = {
    conference: "Salle de Conférence",
    reception: "Réception",
    server: "Salle des Serveurs",
    security: "Salle de Sécurité",
    staff: "Salle du Personnel",
    archives: "Salle d'Archives",
  };

  const experiencesHTML =
    worker.experiences.length > 0
      ? worker.experiences
          .map(
            (exp) => `
                    <div class="info-row">
                        <div class="info-label">${exp.title}</div>
                        <div class="info-value">${exp.company} (${exp.period})</div>
                    </div>
                `
          )
          .join("")
      : '<div class="info-row"><div class="info-value">Aucune expérience renseignée</div></div>';

  document.getElementById("profileContent").innerHTML = `
                <div class="profile-header">
                    <img src="${worker.photo}" alt="${worker.name}">
                    <h2>${worker.name}</h2>
                    <span class="role-badge ${getRoleClass(
                      worker.role
                    )}" style="font-size: 14px; padding: 8px 16px;">${
    worker.role
  }</span>
                </div>
                <div class="profile-info">
                    <div class="info-row">
                        <div class="info-label">Email</div>
                        <div class="info-value">${worker.email}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Téléphone</div>
                        <div class="info-value">${worker.phone}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Localisation</div>
                        <div class="info-value">${
                          worker.room ? roomNames[worker.room] : "Non assigné"
                        }</div>
                    </div>
                </div>
                <div class="profile-info">
                    <h3 style="margin-bottom: 15px; color: #495057;">Expériences Professionnelles</h3>
                    ${experiencesHTML}
                </div>
            `;

  document.getElementById("profileModal").classList.add("active");
}

function closeProfileModal() {
  document.getElementById("profileModal").classList.remove("active");
}

// Initialize
function initializeApp() {
  setupEventListeners();
  renderUnassigned();
  [
    "conference",
    "reception",
    "server",
    "security",
    "staff",
    "archives",
  ].forEach((room) => {
    renderRoom(room);
  });
}

// Start the application by fetching data
fetchWorkersData();