// Carica la navbar dinamicamente
async function loadNavbar() {
  const navbarContainer = document.getElementById('navbar');
  if (!navbarContainer) return;

  try {
    const res = await fetch('/navbar.html'); // usa path assoluto
    if (!res.ok) throw new Error('Navbar non trovata');
    const html = await res.text();
    navbarContainer.innerHTML = html;

    // Eventi ricerca nella navbar
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn && searchInput) {
      const navbarSearch = () => {
        const query = searchInput.value.trim();
        if (!query) return alert("Inserisci un termine di ricerca!");
        // Reindirizzo alla pagina search con parametro q
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      };

      searchBtn.addEventListener('click', navbarSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') navbarSearch();
      });
    }

  } catch (err) {
    navbarContainer.innerHTML = `<p style="color:red;">Errore caricamento navbar: ${err.message}</p>`;
  }
}

// Caricamento immediato
loadNavbar();
