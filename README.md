# BookChain
Progetto sviluppato per l'esame di Sicurezza Dei Dati. Un progetto **Ethereum Book Marketplace** sviluppato in **Python** e **Node.js/Hardhat**. L’app permette di interagire con smart contract Solidity e gestire i dati tramite un backend con Express/MongoDB.  

---

## Funzionalità principali
- Deploy e gestione di smart contract con **Hardhat**
- Interazione con la blockchain tramite **Ethers.js / Web3.js**
- Salvataggio dati su **MongoDB**
- API backend scritte in **Express (Node.js)**
- Supporto a script/utility in **Python**
- Test e simulazioni blockchain con **Ganache**

---

## Prerequisiti
Assicurati di avere installato:
- [Node.js](https://nodejs.org/) (versione consigliata: `>=18`)
- [Python](https://www.python.org/) (versione consigliata: `>=3.10`)
- [MongoDB](https://www.mongodb.com/try/download/community) (opzionale per test locali)
- `git` per clonare il progetto

---

## Installazione

### 1. Clona il repository
```bash
git clone https://github.com/deborapucciarelli/progettoSDD
```

### 2. Crea e avvia un virtual environment
```bash
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
.\.venv\Scripts\activate    # Windows
```

Installa le dipendenze:
```bash
pip install -r requirements.txt
```

### 3. Configurazione MongoDB

Per la persistenza dei dati off-chain, il progetto utilizza **MongoDB**. Crea un file `.env` nella root del progetto e aggiungi la stringa di connessione al tuo database.

```bash
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/bookmarketplace"
```

### 4. Setup ambiente Node.js
Installa le dipendenze Node/Hardhat:
```bash
npm install
```
---

## Avvio del progetto

### Avviare ganache
Avvio del nodo locale con un mnemonic fisso (così da avere sempre gli stessi indirizzi per i test e il collegamento a MetaMask):
```bash
ganache --mnemonic "prova"
```

In un altro terminale, avviare il backend:

```bash
cd book-marketplace
node server.js
```

In un altro terminale, effettuare il deploy degli smart contract sulla blockchain locale usando Hardhat:
```bash
npx hardhat run scripts/deploy.js --network ganache
```

### Il marketplace sarà accessibile dal browser all’indirizzo:
```bash
http://localhost:5000
```








