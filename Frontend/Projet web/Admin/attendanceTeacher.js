document.addEventListener("DOMContentLoaded", () => {
  // Initialisation des variables globales du calendrier
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  let calendarMessages = {};

  const tableBody = document.querySelector("#attendance-table tbody");
  const loadingMessage = document.createElement('div');
  loadingMessage.textContent = 'Chargement des données...';
  tableBody.parentNode.insertBefore(loadingMessage, tableBody);

  const API_URL = "http://localhost:8081/api/seances";
  const ENSEIGNANTS_URL = "http://localhost:8081/api/enseignants";
  const PRESENCE_URL = "http://localhost:8081/presences-enseignants/enregistrer";

  // Authentification basique
  async function fetchWithAuth(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': 'Basic ' + btoa('admin:password')
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  function formatDateForAPI(date) {
    return new Date(date).toISOString().split('T')[0];
  }

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    tableBody.parentNode.replaceChild(errorDiv, tableBody);
    console.error(message);
  }

  async function loadData() {
    try {
      const today = formatDateForAPI(new Date());
      const [seances, enseignants, presences] = await Promise.all([
        fetchWithAuth(`${API_URL}/date/${today}`),
        fetchWithAuth(ENSEIGNANTS_URL),
        fetchWithAuth("http://localhost:8081/presences-enseignants")
      ]);

      if (seances.length === 0) {
        showError("Aucune séance prévue pour aujourd'hui");
        return;
      }

      renderTable(seances, enseignants, presences);
    } catch (error) {
      showError(`Erreur lors du chargement des données: ${error.message}`);
    } finally {
      loadingMessage.remove();
    }
  }

  function renderTable(seances, enseignants, presences) {
    tableBody.innerHTML = "";

    seances.forEach(seance => {
      const enseignant = enseignants.find(e => e.idenseignant === seance.enseignant.idenseignant);
      if (!enseignant) return;

      const presence = presences.find(p => p.seance?.idseance === seance.idseance);
      const statut = presence 
        ? (presence.presenceenseignant ? "Présent" : "Absent")
        : "En attente";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${enseignant.prenomenseignant} ${enseignant.nomenseignant}</td>
        <td>${seance.enseignant?.cours?.nomcours || "Non spécifié"}</td>
        <td>${seance.heureDebutseance} - ${seance.heureFinseance}</td>
        <td>${seance.classe?.nom || "Non spécifié"}</td>
        <td class="${statut.toLowerCase().replace(' ', '-')}">
          ${statut}
          ${statut === "En attente" ? 
            `<button class="btn-present" 
                     data-seance="${seance.idseance}" 
                     data-enseignant="${enseignant.idenseignant}">
              Marquer présent
            </button>` : ''}
        </td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll('.btn-present').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const button = e.target;
        button.disabled = true;
        button.textContent = 'Enregistrement...';

        try {
          const response = await fetchWithAuth(PRESENCE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idSeance: button.dataset.seance,
              idEnseignant: button.dataset.enseignant
            })
          });

          if (response.ok) {
            loadData();
          } else {
            alert("Erreur lors de l'enregistrement");
          }
        } catch (error) {
          console.error("Erreur:", error);
          alert("Erreur technique");
        }
      });
    });
  }

  function initCalendar() {
    const saved = localStorage.getItem("calendarMessages");
    calendarMessages = saved ? JSON.parse(saved) : {
      "2024-04-19": ["⚠️ Réunion pédagogique à 10h", "📝 Deadline pour rapport."],
      "2024-04-22": ["🧑‍🏫 Intervention de Mr. Saidi à 14h"],
      "2024-04-25": ["📢 Nouvelle session de rattrapage ajoutée."]
    };
    saveMessages();
    renderCalendar(currentMonth, currentYear);
  }

  function saveMessages() {
    localStorage.setItem("calendarMessages", JSON.stringify(calendarMessages));
  }

  function renderCalendar(month, year) {
    document.getElementById("current-month-year").textContent = 
      `${monthNames[month]} ${year}`;
    // Implémentez ici la logique d'affichage du calendrier si nécessaire
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
          </li>`).join("")
      }</ul>
    `;

    document.querySelectorAll('.delete-event').forEach(button => {
      button.addEventListener('click', function () {
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
    renderCalendar(currentMonth, currentYear);
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
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
    renderCalendar(currentMonth, currentYear);
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
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Lancement
  initCalendar();
  loadData();
  initClock();
});
