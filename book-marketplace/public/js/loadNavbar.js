// Carica la navbar
async function loadNavbar() {
  const navbarContainer = document.getElementById('navbar');
  try {
    const res = await fetch('navbar.html'); // relativo alla pagina
    if (!res.ok) throw new Error('Navbar non trovata');
    const html = await res.text();
    navbarContainer.innerHTML = html;

    // Eventi ricerca
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchBtn.click();
    });

  } catch (err) {
    navbarContainer.innerHTML = `<p style="color:red;">Errore caricamento navbar: ${err.message}</p>`;
  }
}

// Chiama subito
loadNavbar();
