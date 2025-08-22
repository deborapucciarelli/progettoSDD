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
app.use(express.static(path.join(__dirname, 'public')));

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

// Rotta Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Rotta dettaglio libro
app.get('/book/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'book.html'));
});

// API per lista libri
app.get('/api/books', async (req, res) => {
  try {
    const books = await db.collection("book").find().limit(4).toArray();
    res.json(books);
  } catch (err) {
    console.error("Errore API:", err);
    res.status(500).json({ error: 'Errore nel recupero dei libri' });
  }
});

// API per libro singolo
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await db.collection("book").findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: 'Libro non trovato' });
    res.json(book);
  } catch (err) {
    console.error("Errore dettaglio libro:", err);
    res.status(500).json({ error: 'Errore nel recupero del libro' });
  }
});

// API per recuperare username dal wallet
app.get('/api/getUsername', async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) return res.status(400).json({ error: 'Wallet mancante' });

    const user = await db.collection("users").findOne({ wallet_address: wallet });
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    res.json({ username: user.username });
  } catch (err) {
    console.error("Errore API getUsername:", err);
    res.status(500).json({ error: 'Errore nel recupero username' });
  }
});

// Rotta profilo utente dinamica
app.get('/utente/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await db.collection("users").findOne({ username });
    if (!user) return res.status(404).send('Utente non trovato');

    res.sendFile(path.join(process.cwd(), 'public', 'profilo.html'));
  } catch (err) {
    console.error("Errore rotta utente:", err);
    res.status(500).send('Errore server');
  }
});

// API per recuperare dati utente completi
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
    console.error("Errore API getUserData:", err);
    res.status(500).json({ error: 'Errore nel recupero dati utente' });
  }
});