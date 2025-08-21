import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import path from 'path';               // ✅ importa path una sola volta
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 🔹 Carica il .env che si trova una cartella sopra
dotenv.config({ path: path.resolve('../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve i file statici (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Connessione a MongoDB
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function start() {
  try {
    await client.connect();
    db = client.db("bookDB");
    console.log("MongoDB connesso");

    app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
  } catch (err) {
    console.error(err);
  }
}

start();

// Rotte API
app.get('/books', async (req, res) => {
  const books = await db.collection("books").find().toArray();
  res.json(books);
});

app.get('/books/search', async (req, res) => {
  const { isbn, username } = req.query;
  const query = {};
  if (isbn) query.isbn = isbn;
  if (username) query.username = username;

  const books = await db.collection("books").find(query).toArray();
  res.json(books);
});
