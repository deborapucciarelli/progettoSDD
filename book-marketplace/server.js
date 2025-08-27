import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function start() {
  try {
    await client.connect();
    db = client.db("booksDB");
    console.log("✅ MongoDB connesso");

    app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Errore avvio server:", err);
  }
}

start();

/* ------------------- ROTTE API ------------------- */

// Lista libri generali
app.get('/api/books', async (req, res) => {
  try {
    const books = await db.collection("book").find().toArray();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dei libri' });
  }
});

// Libro singolo
app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await db.collection("book").findOne({ _id: bookId });
    if (!book) return res.status(404).json({ error: 'Libro non trovato' });

    // se esiste un wallet dentro il libro → recupero utente
    if (book.User?.wallet_address) {
      const user = await db.collection("users").findOne({ wallet_address: book.User.wallet_address });
      if (user) {
        book.User.username = user.username; // aggiorno col vero username
      }
    }

    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero del libro' });
  }
});


// Recupera username da wallet
app.get('/api/getUsername', async (req, res) => {
  try {
    let { wallet } = req.query;
    if (!wallet) return res.status(400).json({ error: 'Wallet mancante' });

    // Trasformiamo l'indirizzo in lowercase
    wallet = wallet.toLowerCase();

    // Cerchiamo l'utente usando lowercase
    const user = await db.collection("users").findOne({ wallet_address: wallet });
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    res.json({ username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero username' });
  }
});


// Recupera dati utente completi
app.get('/api/getUserData', async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ error: 'Wallet mancante' });

    const user = await db.collection("users").findOne({ wallet_address: wallet });
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    res.json({
      username: user.username,
      email: user.email,
      wallet_address: user.wallet_address
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dati utente' });
  }
});

// Recupera wallet da username
app.get('/api/getWalletByUsername', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username mancante' });

    const user = await db.collection("users").findOne({ 
      username: { $regex: `^${username}$`, $options: "i" } 
    });

    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    res.json({ wallet: user.wallet_address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero wallet' });
  }
});

// Ricerca libri e utenti
app.get('/api/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ books: [], users: [] });

  try {
    const books = await db.collection("book")
      .find({ "Book-Title": { $regex: q, $options: "i" } })
      .limit(20)
      .toArray();

    const users = await db.collection("users")
      .find({ username: { $regex: q, $options: "i" } })
      .limit(20)
      .toArray();

    res.json({ books, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella ricerca" });
  }
});

// Recupera libri caricati da un wallet
app.get('/api/getBooksByWallet', async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ error: 'Wallet mancante' });

    const books = await db.collection("book")
      .find({ "User.wallet_address": wallet })
      .toArray();

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dei libri' });
  }
});


app.post('/api/loginOrRegister', async (req, res) => {
  try {
    const { wallet } = req.body;
    //console.log("Wallet ricevuto dal frontend:", wallet);

    let user = await db.collection("users").findOne({ wallet_address: wallet });
    //console.log("Utente trovato:", user);

    if (!user) {
      const newUser = {
        username: "N-A",
        email: "N-A",
        wallet_address: wallet
      };
      const result = await db.collection("users").insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
      console.log("Nuovo utente creato:", user);
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore login/registrazione" });
  }
});

// Update utente
app.put('/api/updateUser', async (req, res) => {
  try {
    const { wallet, username, email } = req.body;

    if (!wallet) return res.status(400).json({ error: 'Wallet mancante' });

    // Recupera l'utente tramite wallet (unico identificatore)
    const user = await db.collection("users").findOne({ wallet_address: wallet });
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    const update = {};

    // Controllo unicità username solo se modificato
    if (username && username !== user.username) {
      const existingUser = await db.collection("users").findOne({
        username: username,
        wallet_address: { $ne: wallet }
      });
      if (existingUser) return res.status(409).json({ error: "Username già in uso" });
      update.username = username;
    }

    // Controllo unicità email solo se modificata
    if (email && email !== user.email) {
      const existingEmail = await db.collection("users").findOne({
        email: email,
        wallet_address: { $ne: wallet }
      });
      if (existingEmail) return res.status(409).json({ error: "Email già in uso" });
      update.email = email;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nessun dato da aggiornare" });
    }

    const result = await db.collection("users").findOneAndUpdate(
      { wallet_address: wallet },
      { $set: update },
      { returnDocument: "after" }
    );

    res.json({ success: true, user: result.value });

  } catch (err) {
    console.error("Errore in updateUser:", err);
    res.status(500).json({ error: "Errore interno server: " + err.message });
  }
});

// Aggiungi libro
app.post('/api/addBook', async (req, res) => {
  try {
    const book = req.body;
    if(!book || !book._id || !book.ISBN || !book.User?.wallet_address) {
      return res.status(400).json({ error: "Dati libro incompleti" });
    }

    // Controlla se libro esiste già
    const existing = await db.collection("book").findOne({ _id: book._id });
    if(existing) return res.status(409).json({ error: "Libro già presente" });

    await db.collection("book").insertOne(book);
    res.json({ success: true, book });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Errore aggiunta libro" });
  }
});

// Cancella utente + libri
app.delete('/api/deleteUser', async (req, res) => {
  try {
    const { wallet } = req.body;
    if(!wallet) return res.status(400).json({ error: "Wallet mancante" });

    // Cancella tutti i libri dell'utente
    await db.collection("book").deleteMany({ "User.wallet_address": wallet });

    // Cancella l'utente
    const result = await db.collection("users").deleteOne({ wallet_address: wallet });

    if(result.deletedCount === 0) return res.status(404).json({ error: "Utente non trovato" });

    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella cancellazione profilo" });
  }
});

// DELETE libro singolo
app.delete('/api/deleteBook', async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) return res.status(400).json({ error: "ID libro mancante" });

    // Controlla se il libro esiste
    const book = await db.collection("book").findOne({ _id });
    if (!book) return res.status(404).json({ error: "Libro non trovato" });

    // Controllo proprietà: solo il proprietario può cancellare
    const currentWallet = req.headers['wallet-address'] || null;
    const bookWallet = book.User?.wallet_address || (_id.split('_')[2] || '');
    
    if (currentWallet && currentWallet !== bookWallet) {
      return res.status(403).json({ error: "Non sei autorizzato a cancellare questo libro" });
    }

    await db.collection("book").deleteOne({ _id });
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella cancellazione del libro" });
  }
});

// Elimina libro dopo acquisto
app.delete('/api/buyBook', async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) return res.status(400).json({ error: "ID libro mancante" });

    // Verifica che il libro esista
    const book = await db.collection("book").findOne({ _id });
    if (!book) return res.status(404).json({ error: "Libro non trovato" });

    // Rimuovo libro dal DB
    await db.collection("book").deleteOne({ _id });

    res.json({ success: true, message: "Libro rimosso dopo acquisto" });

  } catch (err) {
    console.error("Errore in /api/buyBook:", err);
    res.status(500).json({ error: "Errore interno server" });
  }
});

/* ------------------- STATIC FILES ------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ------------------- ROTTE HTML ------------------- */

// Pagina dettaglio libro
app.get('/book/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'book.html'));
});

// Pagina profilo
app.get('/utente/:username', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profilo.html'));
});

// Pagina ricerca
app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
