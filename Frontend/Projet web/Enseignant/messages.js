document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user || !user.idenseignant) {
        console.error("Utilisateur non connecté ou ID enseignant manquant");
        window.location.href = "login.html";
        return;
    }

    const currentUserId = user.idenseignant;
    console.log("ID Enseignant connecté:", currentUserId);

    const apiBaseUrl = 'http://localhost:8081/api/notifications-enseignants';
    let notifications = [];

    // Initialisation
    initClock();
    loadNotifications(currentUserId);
    setupEventListeners();
    renderCalendar();

    // Charger les notifications depuis le backend
    function loadNotifications(teacherId) {
        console.log("Chargement notifications pour enseignant ID:", teacherId);

        fetch(`${apiBaseUrl}/enseignant/${teacherId}`)
            .then(response => {
                console.log("Réponse API - Status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log("Données reçues:", data);
                notifications = Array.isArray(data) ? data : data.notifications || [];
                renderNotifications();
            })
            .catch(error => {
                console.error('Erreur:', error);
                document.getElementById('message-history').innerHTML = `
                    <li class="message error">
                        <i class="fas fa-exclamation-triangle"></i>
                        Erreur de chargement: ${error.message}
                    </li>`;
            });
    }

    function renderNotifications(filter = 'received') {
        const historyList = document.getElementById('message-history');
        historyList.innerHTML = '';

        const filteredNotifications = filter === 'received'
            ? notifications
            : [];

        if (!Array.isArray(filteredNotifications)) {
            console.error("Les notifications ne sont pas un tableau :", filteredNotifications);
            historyList.innerHTML = '<li class="message error">Erreur interne : données invalides</li>';
            return;
        }

        if (filteredNotifications.length === 0) {
            historyList.innerHTML = '<li class="message empty">Aucune notification pour le moment</li>';
            return;
        }

        filteredNotifications.forEach(notification => {
            const li = document.createElement('li');
            li.className = 'message received';

            const dateEnvoi = new Date(notification.dateEnvoi);
            const formattedDateEnvoi = dateEnvoi.toLocaleString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            let seanceDetails = '';
            if (notification.dateSeance) {
                const dateSeance = new Date(notification.dateSeance);
                const formattedDateSeance = dateSeance.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                seanceDetails = `
                    <div class="seance-details">
                        <strong>Détails de l'absence:</strong>
                        <div><i class="fas fa-book"></i> ${notification.nomCours || 'Cours non spécifié'}</div>
                        <div><i class="fas fa-calendar-day"></i> ${formattedDateSeance}</div>
                        <div><i class="fas fa-clock"></i> ${notification.heureDebut} - ${notification.heureFin}</div>
                    </div>
                `;
            }

            li.innerHTML = `
                <div class="message-header">
                    <span class="sender">Administrateur</span>
                    <span class="time">${formattedDateEnvoi}</span>
                </div>
                <div class="message-body">
                    <div class="message-content">
                        ${notification.message}
                        ${seanceDetails}
                    </div>
                    ${notification.statut === 'ENVOYEE' ?
                    '<button class="plan-button">Planifier rattrapage</button>' :
                    ''}
                </div>
            `;

            historyList.appendChild(li);
        });

        document.querySelectorAll('.plan-button').forEach(button => {
            button.addEventListener('click', function () {
                window.location.href = 'plannificationRattrapage.html';
            });
        });
    }

    function setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', function () {
                document.querySelectorAll('.filter-btn').forEach(btn =>
                    btn.classList.remove('active'));
                this.classList.add('active');
                renderNotifications(this.dataset.filter);
            });
        });

        document.getElementById('message-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const recipient = document.getElementById('recipient').value;
            const message = document.getElementById('message-content').value.trim();

            if (!message) {
                alert('Veuillez écrire un message');
                return;
            }

            console.log('Message à envoyer:', { recipient, message });
            alert('Message envoyé avec succès!');
            this.reset();
        });
    }

    function initClock() {
        function updateClock() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const clockElement = document.getElementById('time');
            if (clockElement) {
                clockElement.textContent = timeString;
            }
        }

        updateClock();
        setInterval(updateClock, 1000);
    }

    // 📅 Déclaration déplacée ici pour éviter l'erreur "Cannot access 'monthNames'"
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    function renderCalendar() {
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        const monthYearDisplay = document.getElementById('current-month-year');
        const now = new Date();
        const today = now.getDate();

        monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

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
            const isToday = day === today && currentMonth === now.getMonth() && currentYear === now.getFullYear();

            html += `<div class="date ${isToday ? "today" : ""}" data-date="${dateKey}">${day}</div>`;
        }

        calendarEl.innerHTML = html;
    }

    document.getElementById('prev-month')?.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('next-month')?.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Actualisation périodique
    setInterval(() => loadNotifications(currentUserId), 300000); // 5 minutes
});
