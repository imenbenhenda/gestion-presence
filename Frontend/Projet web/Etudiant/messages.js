document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  if (!user || !user.idetudiant) {
      console.error("Utilisateur non connecté ou ID étudiant manquant");
      window.location.href = "login.html";
      return;
  }

  const currentUserId = user.idetudiant;
  const apiBaseUrl = 'http://localhost:8081/notifications';
  
  loadNotifications(currentUserId);

  function loadNotifications(studentId) {
      fetch(`${apiBaseUrl}?idetudiant=${studentId}`)
          .then(response => {
              if (!response.ok) throw new Error('Erreur réseau');
              return response.json();
          })
          .then(data => {
              renderNotifications(data);
          })
          .catch(error => {
              console.error('Erreur:', error);
              renderError(error);
          });
  }

  function renderNotifications(notifications) {
      const historyList = document.getElementById('message-history');
      historyList.innerHTML = '';

      if (!notifications || notifications.length === 0) {
          historyList.innerHTML = `
              <li class="message empty">
                  <i class="fas fa-bell-slash"></i>
                  <div>
                      <p>Aucune notification disponible</p>
                      <small>Vous n'avez reçu aucune notification</small>
                  </div>
              </li>`;
          return;
      }

      notifications.forEach(notification => {
          const li = document.createElement('li');
          li.className = 'message received';
          
          const dateEnvoi = new Date(notification.dateEnvoi);
          const formattedDate = dateEnvoi.toLocaleString('fr-FR', {
              day: '2-digit', 
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          });

          li.innerHTML = `
              <div class="message-header">
                  <span class="sender">Administration</span>
                  <span class="time">${formattedDate}</span>
              </div>
              <div class="message-content">
                  <p>${notification.message}</p>
                  ${notification.seance ? `
                  <div class="seance-info">
                      <small>
                          <i class="fas fa-calendar-day"></i> 
                          ${new Date(notification.seance.dateseance).toLocaleDateString('fr-FR')}
                      </small>
                      <small>
                          <i class="fas fa-clock"></i> 
                          ${notification.seance.heureDebutseance} - ${notification.seance.heureFinseance}
                      </small>
                  </div>` : ''}
              </div>
              <div class="message-status ${notification.statut === 'ENVOYEE' ? 'unread' : 'read'}"></div>
          `;
          
          historyList.appendChild(li);
      });
  }

  function renderError(error) {
      const historyList = document.getElementById('message-history');
      historyList.innerHTML = `
          <li class="message error">
              <i class="fas fa-exclamation-triangle"></i>
              <div>
                  <p>Erreur de chargement</p>
                  <small>${error.message || 'Erreur inconnue'}</small>
              </div>
          </li>`;
  }
});