document.addEventListener("DOMContentLoaded", () => {
  // Récupérer l'utilisateur connecté
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user || !user.idenseignant) {
    window.location.href = "login.html";
    return;
  }

  // Charger les classes disponibles
  loadClasses();
  
  // Gestion du formulaire
  document.getElementById("rattrapage-form").addEventListener("submit", function(e) {
    e.preventDefault();
    submitRattrapage(user.idenseignant);
  });
});

async function loadClasses() {
  try {
    const response = await fetch("http://localhost:8081/classes");
    const classes = await response.json();
    
    const select = document.getElementById("classe");
    classes.forEach(classe => {
      const option = document.createElement("option");
      option.value = classe.idclasse;
      option.textContent = classe.nom;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des classes:", error);
  }
}

async function submitRattrapage(idEnseignant) {
  const formData = {
    enseignant: {
      idenseignant: idEnseignant
    },
    classe: {
      idclasse: document.getElementById("classe").value
    },
    dateRattrapage: document.getElementById("date").value,
    heureDebutrattra: document.getElementById("heureDebut").value,
    heureFinrattra: document.getElementById("heureFin").value,
    salle: document.getElementById("salle").value,
    etatValidation: "En attente"
  };
  

  try {
    const response = await fetch("http://localhost:8081/rattrapages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert("Demande de rattrapage soumise avec succès !");
      window.location.href = "acceuilEnseignant.html";
    } else {
      const error = await response.json();
      alert(`Erreur: ${error.message || "Erreur lors de la soumission"}`);
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur de connexion au serveur");
  }
}