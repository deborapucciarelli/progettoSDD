import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

# ==============================
# Connessione a MongoDB Atlas
# ==============================
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["booksDB"]

book_collection = db["book"]
users_collection = db["users"]
transactions_collection = db["transactions"]

# ==============================
# Reset collezioni
# ==============================
book_collection.delete_many({})
users_collection.delete_many({})
transactions_collection.delete_many({})
print("✅ Collezioni svuotate")

# ==============================
# Caricamento utenti
# ==============================
users_df = pd.read_csv("database/users.csv", sep=";")

users_documents = [
    {
        "username": str(row["username"]),
        "email": str(row["email"]),
        "wallet_address": str(row["wallet_address"]),
    }
    for _, row in users_df.iterrows()
]

if users_documents:
    users_collection.insert_many(users_documents)
print(f"✅ Inseriti {len(users_documents)} utenti")

# Mappa username → user info
user_map = {
    row["username"]: {
        "username": row["username"],
        "wallet_address": row["wallet_address"],
    }
    for _, row in users_df.iterrows()
}

# ==============================
# Caricamento libri
# ==============================
books_df = pd.read_csv("database/book.csv", sep=";")

# Pulizia campi numerici
books_df["Year-Of-Publication"] = pd.to_numeric(
    books_df["Year-Of-Publication"], errors="coerce"
).fillna(0).astype(int)

def format_datetime(dt_str):
    """Converte la stringa della data in formato YYYY-MM-DD_HH-MM-SS"""
    try:
        dt = pd.to_datetime(dt_str)
    except Exception:
        dt = datetime.now()
    return dt.strftime("%Y-%m-%d_%H-%M-%S")

books_documents = []
for _, row in books_df.iterrows():
    user_info = user_map.get(row["UserID"], {"username": "N-A", "wallet_address": None})
    
    # Data creazione come datetime con ora precisa
    data_creazione = format_datetime(row.get("dataCreazione", ""))
    
    # Genera _id nello stesso formato della tua app
    _id = f"{row['ISBN']}_{user_info['username']}_{data_creazione}"
    
    doc = {
        "_id": _id,
        "ISBN": str(row["ISBN"]),
        "Book-Title": str(row["Book-Title"]),
        "Book-Author": str(row["Book-Author"]),
        "Year-Of-Publication": int(row["Year-Of-Publication"]),
        "Publisher": str(row["Publisher"]),
        "Image-URL-S": str(row["Image-URL-S"]),
        "Usato": str(row["usato"]).lower() == "true",
        "DataCreazione": data_creazione,
        "User": user_info,
    }
    books_documents.append(doc)

if books_documents:
    book_collection.insert_many(books_documents)
print(f"✅ Inseriti {len(books_documents)} libri con ID compatibile app")

# ==============================
# Caricamento transazioni
# ==============================
transactions_df = pd.read_csv("database/transaction.csv", sep=";")

transactions_documents = []
for _, row in transactions_df.iterrows():
    doc = {
        "tx_hash": str(row["tx_hash"]),
        "user": {
            "username": str(row["username"]),
            "wallet_address": str(row["wallet_address"])
        },
        "book": {
            "ISBN": str(row["ISBN"]),
            "title": str(row["Book-Title"]),
            "dataCreazione": str(row["DataCreazione"])
        },
        "amount": float(row["amount"]),
        "currency": str(row["currency"]),
        "status": str(row["status"]),
        "timestamp": str(row["timestamp"])
    }
    transactions_documents.append(doc)

if transactions_documents:
    transactions_collection.insert_many(transactions_documents)
print(f"✅ Inserite {len(transactions_documents)} transazioni")

print("🎉 Import completato con successo!")
