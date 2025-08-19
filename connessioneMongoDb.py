import pandas as pd
from pymongo import MongoClient
from bson import ObjectId

# Connessione a MongoDB Atlas
client = MongoClient("mongodb+srv://dbMD:progettoSDD@cluster0.cw4uk5y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

db = client["booksDB"]
collection = db["book"]

# Carica CSV con separatore ';'
df = pd.read_csv("book.csv", sep=";")

# Conversione del campo numerico
df["Year-Of-Publication"] = pd.to_numeric(df["Year-Of-Publication"], errors="coerce").fillna(0).astype(int)

#
documents = []
for _, row in df.iterrows():
    doc = {
        "ISBN":  str(row["ISBN"]),  
        "Book-Title": str(row["Book-Title"]),
        "Book-Author": str(row["Book-Author"]),
        "Year-Of-Publication": int(row["Year-Of-Publication"]),
        "Publisher": str(row["Publisher"]),
        "Image-URL-S": str(row["Image-URL-S"])
    }
    documents.append(doc)

# Inserisci in MongoDB
if documents:
    collection.insert_many(documents)
    print(f"Inseriti {len(documents)} documenti")
else:
    print("Nessun documento da inserire")

