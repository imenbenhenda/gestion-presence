window.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:8080/api/attendances')
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector('tbody');
      tbody.innerHTML = '';
      data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.teacherName}</td>
          <td>${row.subject}</td>
          <td>${row.scheduledTime}</td>
          <td>${row.class}</td>
          <td class="${row.status.toLowerCase()}">${row.status}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error('Error download teacher attendance:', err));
});
