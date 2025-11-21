document.addEventListener("DOMContentLoaded", function() {
    // Vérifier l'authentification
    const user = JSON.parse(sessionStorage.getItem('user'));
    const role = sessionStorage.getItem('role');
    
    if (!user || role !== 'enseignant') {
        window.location.href = '../login_enseignant.html';
        return;
    }

    // Afficher le nom de l'enseignant
    document.querySelector('.user-info span').textContent = `👤 ${user.prenomenseignant} ${user.nomenseignant}`;

    // Charger les séances
    loadSeances();

    // Gestion du bouton d'actualisation
    document.getElementById('refreshSeances').addEventListener('click', loadSeances);

    // Gestion de la déconnexion
    document.querySelector('a[href="../login/index.html"]').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('role');
        window.location.href = '../login_enseignant.html';
    });
});

async function loadSeances() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const container = document.getElementById('seances-container');
    
    // Afficher un indicateur de chargement
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Chargement des séances...</div>';

    try {
        const response = await fetch(`http://localhost:8081/api/seances/enseignant/${user.idenseignant}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des séances');
        }

        const seances = await response.json();
        displaySeances(seances);
    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

function displaySeances(seances) {
    const container = document.getElementById('seances-container');
    
    if (seances.length === 0) {
        container.innerHTML = '<div class="no-seances">Aucune séance prévue pour le moment.</div>';
        return;
    }

    // Trier les séances par date et heure
    seances.sort((a, b) => {
        const dateA = new Date(a.dateseance);
        const dateB = new Date(b.dateseance);
        
        // Si les dates sont différentes, trier par date
        if (dateA.toDateString() !== dateB.toDateString()) {
            return dateA - dateB;
        }
        
        // Si même date, trier par heure de début
        const heureA = a.heureDebutseance.split(':').map(Number);
        const heureB = b.heureDebutseance.split(':').map(Number);
        
        return (heureA[0] * 60 + heureA[1]) - (heureB[0] * 60 + heureB[1]);
    });

    // Grouper par jour avec un format de date cohérent
    const seancesParJour = {};
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    };
    
    seances.forEach(seance => {
        const dateObj = new Date(seance.dateseance);
        // Formatage de la date en français
        const dateKey = dateObj.toLocaleDateString('fr-FR', options);
        
        if (!seancesParJour[dateKey]) {
            seancesParJour[dateKey] = [];
        }
        seancesParJour[dateKey].push(seance);
    });

    // Créer le HTML
    let html = '';
    const now = new Date();
    
    for (const [date, seancesDuJour] of Object.entries(seancesParJour)) {
        html += `<div class="day-section">
                    <h3 class="day-title">${date}</h3>
                    <div class="day-seances">`;

        seancesDuJour.forEach(seance => {
            const seanceDate = new Date(seance.dateseance);
            const heureDebut = seance.heureDebutseance;
            const heureFin = seance.heureFinseance;
            
            // Déterminer le statut plus précisément
            let status = 'upcoming';
            let statusText = 'À venir';
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const seanceDay = new Date(seanceDate);
            seanceDay.setHours(0, 0, 0, 0);
            
            if (seanceDay < today) {
                status = 'completed';
                statusText = 'Terminé';
            } else if (seanceDay.getTime() === today.getTime()) {
                // Vérifier si la séance est en cours maintenant
                const [hours, minutes] = heureDebut.split(':').map(Number);
                const startTime = new Date(seanceDate);
                startTime.setHours(hours, minutes, 0, 0);
                
                const [endHours, endMinutes] = heureFin.split(':').map(Number);
                const endTime = new Date(seanceDate);
                endTime.setHours(endHours, endMinutes, 0, 0);
                
                if (now >= startTime && now <= endTime) {
                    status = 'in-progress';
                    statusText = 'En cours';
                } else if (now > endTime) {
                    status = 'completed';
                    statusText = 'Terminé';
                } else {
                    status = 'today';
                    statusText = 'Aujourd\'hui';
                }
            }

            html += `<a href="appel.html?seanceId=${seance.idseance}" class="course-card">
                        <div class="course-title">${seance.enseignant.cours.nomcours}</div>
                        <p>${seance.classe.nom} - ${seance.salleseance}</p>
                        <div class="course-info">
                            <span class="course-time">${heureDebut} - ${heureFin}</span>
                        </div>
                        <div class="course-info">
                            <span class="status ${status}">${statusText}</span>
                        </div>
                    </a>`;
        });

        html += `</div></div>`;
    }

    container.innerHTML = html;
}