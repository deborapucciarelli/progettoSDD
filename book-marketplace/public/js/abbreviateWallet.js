function abbreviateAddress(address) {
  if(!address) return "";
  return address.slice(0, 6) + "..." + address.slice(-4);
}

// Funzione ricorsiva per abbreviare nodi testo
function abbreviateTextNodes(node) {
  if(node.nodeType === Node.TEXT_NODE) {
    const ethRegex = /0x[a-f0-9]{40}/g;
    node.textContent = node.textContent.replace(ethRegex, match => abbreviateAddress(match));
  } else {
    node.childNodes.forEach(abbreviateTextNodes);
  }
}

// Funzione principale
function abbreviateWalletsInPage(root = document.body) {
  abbreviateTextNodes(root);
}

// Osserva tutte le aggiunte al DOM e abbrevia automaticamente
const observer = new MutationObserver(mutations => {
  mutations.forEach(m => {
    m.addedNodes.forEach(node => {
      if(node.nodeType === Node.ELEMENT_NODE) {
        abbreviateWalletsInPage(node);
      }
    });
  });
});

// Avvia l’osservatore
observer.observe(document.body, { childList: true, subtree: true });

// Abbrevia tutto quello già presente
document.addEventListener("DOMContentLoaded", () => abbreviateWalletsInPage());
