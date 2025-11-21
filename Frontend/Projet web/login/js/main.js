const API_BASE_URL = "http://localhost:8081";

async function fetchAPI(endpoint, method, body = null) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: body ? JSON.stringify(body) : null,
            signal: controller.signal,
            credentials: 'include' // Important pour les cookies/sessions
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `Erreur HTTP ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw new Error(error.message || "Erreur réseau");
    }
}


// le changement de la nav barre quand on scrolle
window.addEventListener('scroll',() => {
    document.querySelector('nav').classList.toggle('wind-scroll', window.scrollY > 100);
});

// Menu dropdown
document.addEventListener("DOMContentLoaded", function () {
    const dropdown = document.querySelector(".dropdown > a");
    const menu = document.querySelector(".dropdown-menu");

    if (dropdown && menu) {
        dropdown.addEventListener("click", function (e) {
            e.preventDefault();
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        });

        document.addEventListener("click", function (e) {
            if (!e.target.closest(".dropdown")) {
                menu.style.display = "none";
            }
        });
    }
});

// le changement des cartes faqs
const faqss = document.querySelectorAll('.faq');
faqss.forEach((faq) => {
    faq.addEventListener('click', () => {
        faq.classList.toggle('open');
    });
});

// menu mobile
const menu = document.querySelector(".nav_menu");
const menubtn = document.querySelector("#openbtnmenu");
const menuclosebtn = document.querySelector("#closebtnmenu");

if (menu && menubtn && menuclosebtn) {
    menubtn.addEventListener('click', () => {
        menu.style.display = "flex";
        menubtn.style.display = "none";
        menuclosebtn.style.display = "inline-block";
    });

    menuclosebtn.addEventListener('click', () => {
        menu.style.display = "none";
        menuclosebtn.style.display = "none";
        menubtn.style.display = "inline-block";
    });
}

///////////////////////////////////////login admin////////////
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("usernameadmin")?.value;
            const password = document.getElementById("passwordadmin")?.value;

            if (!username || !password) {
                alert("Veuillez remplir tous les champs");
                return;
            }

            try {
                const admin = await fetchAPI('/api/admins/login', 'POST', {
                    usernameadmin: username,
                    passwordadmin: password
                });
                
                sessionStorage.setItem('user', JSON.stringify(admin));
                sessionStorage.setItem('role', 'admin');
                window.location.href = "../Admin/attendanceTeacher.html";
            } catch (error) {
                console.error("Erreur connexion admin:", error);
                alert(error.message || "Identifiants incorrects");
            }
        });
    }
});

///////////////////////////////////////login enseignant////////////
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("loginEnseignantForm");
    
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const btn = form.querySelector('button[type="submit"]');
            const errorDiv = document.getElementById('error-message');
            
            try {
                // UI Feedback
                btn.disabled = true;
                btn.innerHTML = '<i class="uil uil-spinner uil-spin"></i> Connexion...';
                if (errorDiv) errorDiv.textContent = '';
                
                // Validation
                const username = form.usernameenseignant.value.trim();
                const password = form.passwordenseignant.value;
                
                if (!username || !password) {
                    throw new Error("Veuillez remplir tous les champs");
                }
                
                // Appel API avec gestion d'erreur améliorée
                let response;
                try {
                    response = await fetch('http://localhost:8081/api/enseignants/login', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            usernameenseignant: username,
                            passwordenseignant: password
                        }),
                        credentials: 'include',
                        mode: 'cors'
                    });
                } catch (networkError) {
                    console.error("Erreur réseau:", networkError);
                    throw new Error("Impossible de se connecter au serveur. Vérifiez votre connexion.");
                }
                
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error || `Erreur HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                // Stockage session
                sessionStorage.setItem('user', JSON.stringify(data));
                sessionStorage.setItem('role', 'enseignant');
                
                console.log("Structure de dossiers actuelle :", window.location.pathname);
                console.log("Redirection vers :", "../Enseignant/acceuilEnseignant.html");
                window.location.href = "../Enseignant/acceuilEnseignant.html"; 
                
            } catch (error) {
                console.error("Erreur de connexion:", error);
                if (errorDiv) {
                    errorDiv.textContent = error.message;
                } else {
                    alert(error.message);
                }
            } finally {
                btn.disabled = false;
                btn.textContent = "SE CONNECTER";
            }
        });
    }
});
///////////////////////////////////////login etudiant////////////
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginEtudiantForm");

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("usernameetudiant")?.value;
            const password = document.getElementById("passwordetudiant")?.value;

            if (!username || !password) {
                alert("Veuillez remplir tous les champs");
                return;
            }

            try {
                const etudiant = await fetchAPI('/api/etudiants/login', 'POST', {
                    usernameetudiant: username,
                    passwordetudiant: password
                });
                
                sessionStorage.setItem('user', JSON.stringify(etudiant));
                sessionStorage.setItem('role', 'etudiant');
                window.location.href = "../Etudiant/messages.html";
            } catch (error) {
                console.error("Erreur connexion étudiant:", error);
                alert(error.message || "Identifiants incorrects");
            }
        });
    }
});

// Vérification d'authentification pour les pages protégées
document.addEventListener("DOMContentLoaded", function() {
    const protectedPages = {
        'Admin': ['attendanceTeacher.html'],
        'Enseignant': ['acceuilEnseignant.html'],
        'Etudiant': ['attendance.html']
    };

    const currentPage = window.location.pathname.split('/').pop();
    const user = JSON.parse(sessionStorage.getItem('user'));
    const role = sessionStorage.getItem('role');

    // Si on est sur une page protégée
    for (const [r, pages] of Object.entries(protectedPages)) {
        if (pages.includes(currentPage)) {
            // Rediriger si non authentifié ou mauvais rôle
            if (!user || !role || role !== r) {
                window.location.href = '../login.html';
            }
            return;
        }
    }
});