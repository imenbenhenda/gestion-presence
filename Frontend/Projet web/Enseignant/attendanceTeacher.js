document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#attendance-table tbody");
  const searchInput = document.getElementById("search");

  const API_URL = "http://localhost:8080/api/attendance"; 

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      renderTable(data);
    })
    .catch(err => console.error("Erreur API:", err));

  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.NomEnseignant}</td>
        <td>${row.Matière}</td>
        <td>${row.Heureprévue}</td>
        <td>${row.classe}</td>
        <td class="${row.statut.toLowerCase()}">${row.statut}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? "" : "none";
    });
  });

  const timeEl = document.getElementById("time");
  if (timeEl) {
    setInterval(() => {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString();
    }, 1000);
  }
});

function loadMessages() {
  const saved = localStorage.getItem("calendarMessages");
  return saved ? JSON.parse(saved) : {};
}

function saveMessages() {
  localStorage.setItem("calendarMessages", JSON.stringify(calendarMessages));
}

let calendarMessages = loadMessages();
if (Object.keys(calendarMessages).length === 0) {
  calendarMessages = {
    "2024-04-19": ["⚠️ Réunion pédagogique à 10h", "📝 Deadline pour rapport."],
    "2024-04-22": ["🧑‍🏫 Intervention de Mr. Saidi à 14h"],
    "2024-04-25": ["📢 Nouvelle session de rattrapage ajoutée."]
  };
  saveMessages();
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                   "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

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

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

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

document.addEventListener("DOMContentLoaded", initClock);
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  initClock();
});
// Animation pour les cartes statistiques
document.addEventListener('DOMContentLoaded', function() {
  // Animation des nombres dans les cartes
  const numberElements = document.querySelectorAll('.numbers');
  
  numberElements.forEach(element => {
    const target = parseInt(element.textContent);
    let current = 0;
    const increment = target / 50;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        clearInterval(timer);
        current = target;
      }
      element.textContent = Math.floor(current);
    }, 20);
  });

  // Fonctionnalité de recherche
  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
      const title = card.querySelector('.course-title').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      
      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Animation au survol des cartes de cours
  const courseCards = document.querySelectorAll('.course-card');
  courseCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    });
  });
});
function toggleAbsence(checkbox) {
  const row = checkbox.closest('tr');
  const absentBox = row.querySelector('.absent');
  if (checkbox.checked) {
    absentBox.checked = false;
  }
}

function togglePresence(checkbox) {
  const row = checkbox.closest('tr');
  const presentBox = row.querySelector('.present');
  if (checkbox.checked) {
    presentBox.checked = false;
  }
}

function enregistrerAppel() {
  const rows = document.querySelectorAll('.attendance-table tbody tr');
  let result = [];
  rows.forEach(row => {
    const id = row.cells[0].innerText;
    const nom = row.cells[1].innerText;
    const prenom = row.cells[2].innerText;
    const present = row.querySelector('.present').checked;
    const absent = row.querySelector('.absent').checked;
    result.push({ id, nom, prenom, status: present ? "Présent" : absent ? "Absent" : "Non coché" });
  });

  console.log(result);
  alert("Appel enregistré dans la console !");
}
document.addEventListener("DOMContentLoaded", () => {
  const courseCards = document.querySelectorAll(".course-card");

  courseCards.forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = "appel.html";
    });
  });
});
