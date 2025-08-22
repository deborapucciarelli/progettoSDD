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
    const book = await db.collection("book").findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: 'Libro non trovato' });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero del libro' });
  }
});

// Recupera username da wallet
app.get('/api/getUsername', async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ error: 'Wallet mancante' });

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
