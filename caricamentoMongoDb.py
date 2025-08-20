import pandas as pd
from pymongo import MongoClient

# Connessione a MongoDB Atlas
client = MongoClient("mongodb+srv://dbMD:progettoSDD@cluster0.cw4uk5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["booksDB"]

# Collezioni
book_collection = db["book"]
users_collection = db["users"]
transactions_collection = db["transactions"]

# Pulisce le collezioni esistenti (sovrascrive)
book_collection.delete_many({})
users_collection.delete_many({})
transactions_collection.delete_many({})
print("Collezioni svuotate")

# Carica CSV utenti
users_df = pd.read_csv("database/users.csv", sep=";")

# Inserisci utenti
users_documents = []
for _, row in users_df.iterrows():
    doc = {
        "username": str(row["username"]),
        "email": str(row["email"]),
        "wallet_address": str(row["wallet_address"])
    }
    users_documents.append(doc)
if users_documents:
    users_collection.insert_many(users_documents)
print(f"Inseriti {len(users_documents)} utenti")

# Mapping UserID → utente (username + wallet)
user_map = {}
for idx, row in enumerate(users_df.itertuples(), start=1):
    user_map[str(idx)] = {
        "username": row.username,
        "wallet_address": row.wallet_address
    }


# Carica CSV libri
books_df = pd.read_csv("database/book.csv", sep=";")
books_df["Year-Of-Publication"] = pd.to_numeric(
    books_df["Year-Of-Publication"], errors="coerce"
).fillna(0).astype(int)

# Inserimento libri arricchiti con User e dataCreazione
books_documents = []
for _, row in books_df.iterrows():
    user_info = user_map.get(str(row["UserID"]), {"username": None, "wallet_address": None})
    doc = {
        "ISBN": str(row["ISBN"]),
        "Book-Title": str(row["Book-Title"]),
        "Book-Author": str(row["Book-Author"]),
        "Year-Of-Publication": int(row["Year-Of-Publication"]),
        "Publisher": str(row["Publisher"]),
        "Image-URL-S": str(row["Image-URL-S"]),
        "Usato": row["usato"] == "True",
        "DataCreazione": str(row["dataCreazione"]),
        "User": user_info
    }
    books_documents.append(doc)
if books_documents:
    book_collection.insert_many(books_documents)
print(f"Inseriti {len(books_documents)} libri arricchiti con utente e dataCreazione")




# Carica CSV transazioni
transactions_df = pd.read_csv("database/transaction.csv", sep=";")

transactions_documents = []
for _, row in transactions_df.iterrows():
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
