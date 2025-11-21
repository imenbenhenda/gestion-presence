document.addEventListener("DOMContentLoaded", function() {
    // Récupérer l'ID de la séance depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const seanceId = urlParams.get('seanceId');
    
    if (!seanceId) {
        alert("Aucune séance sélectionnée");
        window.location.href = "acceuilEnseignant.html";
        return;
    }

    // Récupérer les infos utilisateur
    const user = JSON.parse(sessionStorage.getItem('user'));
    document.getElementById('enseignant-nom').textContent = `👤 ${user.prenomenseignant} ${user.nomenseignant}`;

    // Charger les données de la séance et des étudiants
    loadSeanceData(seanceId);
    loadEtudiants(seanceId);

    // Gestion des événements
    document.getElementById('btn-tous-present').addEventListener('click', marquerTousPresent);
    document.getElementById('btn-tous-absent').addEventListener('click', marquerTousAbsent);
    document.getElementById('btn-enregistrer').addEventListener('click', enregistrerAppel);
    document.getElementById('btn-annuler').addEventListener('click', () => {
        window.location.href = "acceuilEnseignant.html";
    });
});

async function loadSeanceData(seanceId) {
    try {
        const response = await fetch(`http://localhost:8081/api/seances/${seanceId}`);
        if (!response.ok) throw new Error('Erreur lors du chargement de la séance');
        
        const seance = await response.json();
        
        if (!seance) {
            throw new Error('Séance non trouvée');
        }
        
        // Afficher les infos de la séance
        document.getElementById('cours-titre').textContent = seance.enseignant?.cours?.nomcours || 'Cours non spécifié';
        document.getElementById('seance-info').textContent = 
            `Séance du ${new Date(seance.dateseance).toLocaleDateString('fr-FR')} | 
             ${seance.heureDebutseance}-${seance.heureFinseance} | 
             ${seance.salleseance}`;
    } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de charger les données de la séance: " + error.message);
    }
}

async function loadEtudiants(seanceId) {
    try {
        // 1. Récupérer la séance pour avoir l'ID de la classe
        const seanceResponse = await fetch(`http://localhost:8081/api/seances/${seanceId}`);
        if (!seanceResponse.ok) throw new Error('Erreur lors du chargement de la séance');
        const seance = await seanceResponse.json();
        
        if (!seance?.classe?.idclasse) {
            throw new Error('Classe non trouvée pour cette séance');
        }
        
        // 2. Récupérer les étudiants de cette classe
        const etudiantsResponse = await fetch(`http://localhost:8081/api/etudiants/classe/${seance.classe.idclasse}`);
        if (!etudiantsResponse.ok) throw new Error('Erreur lors du chargement des étudiants');
        const etudiants = await etudiantsResponse.json();
        
        if (!etudiants || etudiants.length === 0) {
            throw new Error('Aucun étudiant trouvé pour cette classe');
        }
        
        // 3. Afficher les étudiants
        const tbody = document.getElementById('etudiants-list');
        tbody.innerHTML = '';
        
        etudiants.forEach(etudiant => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${etudiant.idetudiant}</td>
                <td>${etudiant.nometudiant}</td>
                <td>${etudiant.prenometudiant}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" 
                               data-etudiant-id="${etudiant.idetudiant}"
                               checked> <!-- Par défaut, tous présents -->
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <input type="text" 
                           data-etudiant-id="${etudiant.idetudiant}"
                           placeholder="Commentaire...">
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erreur:", error);
        document.getElementById('etudiants-list').innerHTML = `
            <tr>
                <td colspan="5" class="error">${error.message}</td>
            </tr>
        `;
    }
}

function marquerTousPresent() {
    document.querySelectorAll('#etudiants-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
    });
}

function marquerTousAbsent() {
    document.querySelectorAll('#etudiants-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}
async function enregistrerAppel() {
    const btnEnregistrer = document.getElementById('btn-enregistrer');
    btnEnregistrer.disabled = true;
    btnEnregistrer.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

    try {
        const presences = Array.from(document.querySelectorAll('#etudiants-list tr')).map(tr => {
            const checkbox = tr.querySelector('input[type="checkbox"]');
            return {
                idEtudiant: parseInt(checkbox.dataset.etudiantId),
                present: checkbox.checked
            };
        });

        const payload = {
            idSeance: parseInt(new URLSearchParams(window.location.search).get('seanceId')),
            idEnseignant: JSON.parse(sessionStorage.getItem('user')).idenseignant,
            presences: presences
        };

        const response = await fetch('http://localhost:8081/presences-etudiants/enregistrer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Erreur serveur");
        }

        const result = await response.json();
        alert(result.message);
        window.location.href = "acceuilEnseignant.html";
        
    } catch (error) {
        console.error(error);
        alert(`Échec: ${error.message}`);
    } finally {
        btnEnregistrer.disabled = false;
        btnEnregistrer.textContent = 'Enregistrer l\'appel';
    }
}