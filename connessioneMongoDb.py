import pandas as pd
from pymongo import MongoClient
from bson import ObjectId

# Connessione a MongoDB Atlas
client = MongoClient("mongodb+srv://dbMD:progettoSDD@cluster0.cw4uk5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

db = client["booksDB"]

# Collezioni
book_collection = db["book"]
transactions_collection = db["transactions"]
users_collection = db["users"]

# Pulisce le collezioni esistenti (sovrascrive)
book_collection.delete_many({})

# Crea la collezione vuota transactions
transactions_collection.insert_one({"init": True})
transactions_collection.delete_many({})

# Pulisce la collezione users
users_collection.delete_many({})

print("Collezioni 'book' svuotata, 'transactions' creata e 'users' pronta per essere popolata")

# Carica CSV libri con separatore ';'
df_books = pd.read_csv("book.csv", sep=";")

# Conversione del campo numerico
df_books["Year-Of-Publication"] = pd.to_numeric(df_books["Year-Of-Publication"], errors="coerce").fillna(0).astype(int)

# Inserimento libri
book_documents = []
for _, row in df_books.iterrows():
    doc = {
        "ISBN":  str(row["ISBN"]),  
        "Book-Title": str(row["Book-Title"]),
        "Book-Author": str(row["Book-Author"]),
        "Year-Of-Publication": int(row["Year-Of-Publication"]),
        "Publisher": str(row["Publisher"]),
        "Image-URL-S": str(row["Image-URL-S"])
    }
    book_documents.append(doc)

# Inserisci libri in MongoDB
if book_documents:
    book_collection.insert_many(book_documents)
    print(f"Inseriti {len(book_documents)} libri")
else:
    print("Nessun libro da inserire")

# Carica CSV utenti
df_users = pd.read_csv("users.csv", sep=";")  # o ',' se il CSV è separato da virgola

# Inserimento utenti
users_documents = []
for _, row in df_users.iterrows():
    doc = {
        "username": str(row["username"]),
        "email": str(row["email"]),
        "wallet_address": str(row["wallet_address"])
    }
    users_documents.append(doc)

# Inserisci utenti in MongoDB
if users_documents:
    users_collection.insert_many(users_documents)
    print(f"Inseriti {len(users_documents)} utenti")
else:
    print("Nessun utente da inserire")
