import express from 'express';
import { MongoClient } from 'mongodb';
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
    console.log("MongoDB connesso");

    app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
  } catch (err) {
    console.error(err);
  }
}

start();

// Rotta Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// API per prendere i libri (max 5)
app.get('/api/books', async (req, res) => {
  try {
    const books = await db.collection("book").find().limit(5).toArray();
    console.log("Libri trovati:", books);   // 👈 debug
    res.json(books);
  } catch (err) {
    console.error("Errore API:", err);
    res.status(500).json({ error: 'Errore nel recupero dei libri' });
  }
});

