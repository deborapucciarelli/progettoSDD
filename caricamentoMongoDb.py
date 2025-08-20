import pandas as pd
from pymongo import MongoClient

# Connessione a MongoDB Atlas
client = MongoClient("mongodb+srv://dbMD:progettoSDD@cluster0.cw4uk5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["booksDB"]

# Collezioni
book_collection = db["book"]
transactions_collection = db["transactions"]
users_collection = db["users"]

# Pulisce le collezioni esistenti
book_collection.delete_many({})
transactions_collection.delete_many({})
users_collection.delete_many({})

print("Collezioni svuotate e pronte per l'inserimento.")

# ===============================
# CARICAMENTO BOOKS
# ===============================
df_books = pd.read_csv("database/book.csv", sep=";")

# Conversione numerica su "Year-Of-Publication"
df_books["Year-Of-Publication"] = pd.to_numeric(df_books["Year-Of-Publication"], errors="coerce").fillna(0).astype(int)

book_documents = []
for _, row in df_books.iterrows():
    doc = {
        "ISBN": str(row["ISBN"]),
        "Book-Title": str(row["Book-Title"]),
        "Book-Author": str(row["Book-Author"]),
        "Year-Of-Publication": int(row["Year-Of-Publication"]),
        "Publisher": str(row["Publisher"]),
        "Image-URL-S": str(row["Image-URL-S"]),
        "usato": bool(row["usato"]),                     # aggiunto
        "dataCreazione": str(row["dataCreazione"]),      # aggiunto
        "UserID": str(row["UserID"])                     # aggiunto
    }
    book_documents.append(doc)

if book_documents:
    book_collection.insert_many(book_documents)
    print(f"Inseriti {len(book_documents)} libri")
else:
    print("Nessun libro da inserire")

# ===============================
# CARICAMENTO USERS
# ===============================
df_users = pd.read_csv("database/users.csv", sep=";")

users_documents = []
for _, row in df_users.iterrows():
    doc = {
        "username": str(row["username"]),
        "email": str(row["email"]),
        "wallet_address": str(row["wallet_address"]),
        
    }
    users_documents.append(doc)

if users_documents:
    users_collection.insert_many(users_documents)
    print(f"Inseriti {len(users_documents)} utenti")
else:
    print("Nessun utente da inserire")

# ===============================
# CARICAMENTO TRANSACTIONS
# ===============================
df_txn = pd.read_csv("database/transaction.csv", sep=";")

transactions_documents = []
for _, row in df_txn.iterrows():
    doc = {
        "TransactionID": str(row["TransactionID"]),
        "UserID": str(row["UserID"]),
        "BookId": str(row["BookId"]),
        "amount": float(row["amount"]),
        "currency": str(row["currency"]),
        "status": str(row["status"]),
        "timestamp": str(row["timestamp"])
    }
    transactions_documents.append(doc)

if transactions_documents:
    transactions_collection.insert_many(transactions_documents)
    print(f"Inserite {len(transactions_documents)} transazioni")
else:
    print("Nessuna transazione da inserire")
