import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# ==============================
# Connessione a MongoDB Atlas
# ==============================
# Carica le variabili dal .env
load_dotenv()

# Prendi l'URI dal .env
MONGO_URI = os.getenv("MONGO_URI")

# Connessione a MongoDB
client = MongoClient(MONGO_URI)
db = client["booksDB"]

# Collezione libri
book_collection = db["book"]

def add_book(isbn, title, author, year, publisher, image_url, usato, username, wallet_address):
    """
    Inserisce un nuovo libro nel database
    """

    now = datetime.datetime.utcnow().isoformat()
    # L'ID sarà direttamente la combinazione che hai deciso
    book_id = f"{isbn}_{username}_{now}"

    book_doc = {
        "_id": book_id,   # uso direttamente la combinazione come _id
        "ISBN": isbn,
        "Book-Title": title,
        "Book-Author": author,
        "Year-Of-Publication": int(year),
        "Publisher": publisher,
        "Image-URL-S": image_url,
        "Usato": bool(usato),
        "DataCreazione": now,
        "User": {
            "username": username,
            "wallet_address": wallet_address
        }
    }

    result = book_collection.insert_one(book_doc)
    print(f"✅ Libro aggiunto con ID: {book_id}")
    return result.inserted_id


def compra_book(isbn, username, wallet_address, price_eth):
    """
    Registra l'acquisto di un libro su MongoDB.
    """
    # Trova il libro da comprare
    book = book_collection.find_one({"_id": {"$regex": f"^{isbn}_{username}_"}})
    if not book:
        print("❌ Libro non trovato")
        return None

    now = datetime.datetime.utcnow().isoformat()

    tx_doc = {
        "tx_hash": "TO_BE_FILLED_BY_CONTRACT",  # placeholder, poi da sostituire con tx hash reale
        "user": {
            "username": username,
            "wallet_address": wallet_address
        },
        "book": {
            "ISBN": isbn,
            "title": book["Book-Title"],
            "DataCreazione": book["DataCreazione"]
        },
        "amount": float(price_eth),
        "currency": "ETH",
        "status": "completed",  # o "failed"
        "timestamp": now
    }

    result = transactions_collection.insert_one(tx_doc)
    print(f"✅ Transazione registrata con ID: {result.inserted_id}")
    return result.inserted_id
