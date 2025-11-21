// Déclaration des variables globales
let calendarMessages = {};
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                   "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  loadMessages();
  initClock();
  renderCalendar();
  loadRattrapages();
});

// Charger les messages depuis le localStorage
function loadMessages() {
  const saved = localStorage.getItem("calendarMessages");
  calendarMessages = saved ? JSON.parse(saved) : {
    "2024-04-19": ["⚠️ Réunion pédagogique à 10h", "📝 Deadline pour rapport."],
    "2024-04-22": ["🧑‍🏫 Intervention de Mr. Saidi à 14h"],
    "2024-04-25": ["📢 Nouvelle session de rattrapage ajoutée."]
  };
}

// Sauvegarder les messages dans le localStorage
function saveMessages() {
  localStorage.setItem("calendarMessages", JSON.stringify(calendarMessages));
}

// Charger les demandes de rattrapage
async function loadRattrapages() {
  try {
    const response = await fetch('http://localhost:8081/rattrapages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }
    
    const rattrapages = await response.json();
    console.log("Données reçues:", rattrapages); // Debug
    
    if (!Array.isArray(rattrapages)) {
      throw new Error("La réponse n'est pas un tableau");
    }
    
    displayRattrapages(rattrapages);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    showError(`Erreur lors du chargement: ${error.message}`);
  }
}

// Afficher les rattrapages dans le tableau
function displayRattrapages(rattrapages) {
  const tbody = document.querySelector("#session-table tbody");
  tbody.innerHTML = "";

  if (!rattrapages || rattrapages.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">Aucune demande de rattrapage</td></tr>`;
    return;
  }

  rattrapages.forEach(rattrapage => {
    console.log("Traitement du rattrapage:", rattrapage); // Debug
    
    const enseignantNom = rattrapage.enseignant ? 
          `${rattrapage.enseignant.prenomenseignant || ''} ${rattrapage.enseignant.nomenseignant || ''}` : 
          'Non spécifié';
    
    const coursNom = rattrapage.enseignant?.cours?.nomcours || 'Non spécifié';
    const date = rattrapage.dateRattrapage ? formatDate(rattrapage.dateRattrapage) : 'Non défini';
    const classeNom = rattrapage.classe?.nom || 'Non spécifié';
    const salle = rattrapage.salle || 'À définir';
    const etatValidation = rattrapage.etatValidation || 'En attente';

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${enseignantNom}</td>
      <td>${coursNom}</td>
      <td>${date}</td>
      <td>${classeNom}</td>
      <td>${salle}</td>
      <td>
        ${etatValidation === 'Accepté' || etatValidation === 'Refusé' 
          ? etatValidation 
          : `<select class="action-select" data-id="${rattrapage.idrattrapage}">
               <option value="">Action</option>
               <option value="accept">Accepter</option>
               <option value="reject">Refuser</option>
             </select>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Gestion des actions
  document.querySelectorAll('.action-select').forEach(select => {
    select.addEventListener('change', function() {
      const action = this.value;
      const id = this.dataset.id;
      
      if (action) {
        updateRattrapageStatus(id, action);
        this.value = ""; // Réinitialiser la sélection
      }
    });
  });
}

// Mettre à jour le statut d'un rattrapage
async function updateRattrapageStatus(id, action) {
  try {
    const response = await fetch(`http://localhost:8081/rattrapages/${id}/${action}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const updatedRattrapage = await response.json();
      if (updatedRattrapage.etatValidation !== (action === 'accept' ? 'Accepté' : 'Refusé')) {
        throw new Error("Le statut du rattrapage n'a pas été mis à jour correctement.");
      }
      const message = action === 'accept' 
        ? 'Demande acceptée. Notifications envoyées à l\'enseignant et aux étudiants.'
        : 'Demande refusée.';
      showSuccess(message);
      loadRattrapages(); // Recharger la liste
    } else {
      const errorText = await response.text();
      const errorMessage = errorText.includes("dateRattrapage") 
        ? "Échec de la mise à jour : la date de rattrapage est manquante."
        : `Échec de la mise à jour : ${errorText}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Erreur:", error);
    showError(error.message);
  }
}

// Fonctions utilitaires
function formatDate(dateString) {
  if (!dateString) return 'Non défini';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}

function showError(message) {
  const alert = document.createElement('div');
  alert.className = 'alert error';
  alert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  document.querySelector('.content').prepend(alert);
  setTimeout(() => alert.remove(), 5000);
}

function showSuccess(message) {
  const alert = document.createElement('div');
  alert.className = 'alert success';
  alert.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.querySelector('.content').prepend(alert);
  setTimeout(() => alert.remove(), 5000);
}

// Fonctions pour le calendrier
function renderCalendar() {
  const calendarEl = document.getElementById("calendar");
  const monthYearDisplay = document.getElementById("current-month-year");
  
  monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  const now = new Date();
  const today = now.getDate();
  const currentMonthCheck = now.getMonth();
  const currentYearCheck = now.getFullYear();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  let html = '';

  const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  daysOfWeek.forEach(day => {
    html += `<div class="day">${day}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="empty-day"></div>`;
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = day === today && currentMonth === currentMonthCheck && currentYear === currentYearCheck;

    html += `<div class="date ${isToday ? "today" : ""}" data-date="${dateKey}">${day}</div>`;
  }

  calendarEl.innerHTML = html;

  document.querySelectorAll(".date").forEach(el => {
    el.addEventListener("click", () => {
      const selectedDate = el.dataset.date;
      showDayEvents(selectedDate);
    });
  });

  if (currentMonth === currentMonthCheck && currentYear === currentYearCheck) {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`;
    showDayEvents(dateKey);
  }
}

function showDayEvents(dateKey) {
  const messagesEl = document.getElementById("calendar-messages");
  const events = calendarMessages[dateKey] || ["Aucun événement pour ce jour."];
  
  messagesEl.innerHTML = `
    <h3>Événements du ${formatDate(dateKey)}</h3>
    <ul id="events-list">${
      events.map((msg, index) => `
        <li>
          ${msg}
          <button class="delete-event" data-date="${dateKey}" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </li>`
      ).join("")
    }</ul>
  `;
  document.querySelectorAll('.delete-event').forEach(button => {
    button.addEventListener('click', function() {
      const date = this.getAttribute('data-date');
      const index = parseInt(this.getAttribute('data-index'));
      deleteEvent(date, index);
    });
  });
}

function deleteEvent(date, index) {
  if (confirm("Voulez-vous vraiment supprimer cet événement ?")) {
    if (calendarMessages[date] && calendarMessages[date].length > index) {
      calendarMessages[date].splice(index, 1);
      
      if (calendarMessages[date].length === 0) {
        delete calendarMessages[date];
      }
      
      saveMessages();
      showDayEvents(date); 
    }
  }
}

// Gestion des mois
document.getElementById("prev-month").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

// Gestion du formulaire
document.getElementById("event-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const date = document.getElementById("event-date").value;
  const text = document.getElementById("event-text").value.trim();

  if (!date || !text) return;

  if (!calendarMessages[date]) {
    calendarMessages[date] = [];
  }

  calendarMessages[date].push(text);
  saveMessages();

  alert(`✔️ Événement ajouté pour le ${formatDate(date)}`);
  e.target.reset();

  renderCalendar();
  document.querySelector(`.date[data-date="${date}"]`)?.click();
});

// Horloge
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  document.getElementById('time').innerHTML = `<i class="fas fa-clock"></i> ${timeString}`;
}

function initClock() {
  if (document.getElementById('time')) {
    updateClock();
    setInterval(updateClock, 1000);
  } else {
    console.error("L'élément pour l'horloge n'a pas été trouvé");
  }
}