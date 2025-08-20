from web3 import Web3
import json
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os

# =======================
# Connessione nodo Ganache
# =======================
# Placeholder: URL del nodo Ethereum locale o remoto (Ganache, Infura, Alchemy, ecc.)
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))  
assert w3.is_connected(), "❌ Nodo non connesso!"

# =======================
# ABI e indirizzo contratto
# =======================
# Placeholder: Indirizzo del contratto deployato su Ganache / testnet / mainnet
contract_address = "0xf8e81D47203A594245E36C48e151709F0C19fBe8"

# Placeholder: Percorso al file ABI JSON generato dopo il deploy del contratto
abi = json.load(open("book-marketplace/contracts/BookStoreABI.json"))

# Crea l'oggetto contratto per interagire con le funzioni
contract = w3.eth.contract(address=contract_address, abi=abi)

# =======================
# Dati test
# =======================
# Qui metti i dati del libro che vuoi testare
book = {
    "ISBN": "195153448",          # Placeholder: inserisci l'ISBN del libro
    "title": "Classical Mythology",  # Placeholder: titolo del libro
    "dataCreazione": "2018-10-26"   # Placeholder: data di creazione / pubblicazione
}

# Dati utente che effettua l'operazione
user = {
    "username": "alice",  # Placeholder: username dell'utente
    "wallet_address": "0x73A339bcE0dB1D628Ad4d47AA8EBfdC4423f0291"  # Placeholder: indirizzo wallet Ethereum dell'utente
}

# Prezzo del libro in ETH
amount_eth = 0.01  # Placeholder: puoi cambiare il prezzo a piacere

# Private key per firmare le transazioni
# ⚠️ Placeholder: la tua private key del wallet sopra. Non condividerla mai pubblicamente
private_key = "0xd9604a2e7f49606215a24d483fcdf40b8b405b3befcf74dc8b1308b3c088c641"

# =======================
# Genera bookId coerente
# =======================
# book_id è un identificativo unico per libro+utente+data
book_id = f"{book['ISBN']}_{user['username']}_{book['dataCreazione']}"
price_wei = w3.to_wei(amount_eth, 'ether')  # Converte ETH in Wei

# =======================
# 1️⃣ Aggiungi libro (solo test)
# =======================
# Ottieni il nonce del wallet (necessario per costruire la transazione)
nonce = w3.eth.get_transaction_count(user["wallet_address"])

# Costruisci la transazione per aggiungere il libro
tx_add = contract.functions.addBook(book_id, price_wei).build_transaction({
    'from': user["wallet_address"],
    'gas': 200000,                 # Gas stimato (puoi aggiustarlo se la transazione fallisce)
    'gasPrice': w3.to_wei('50', 'gwei'),  # Prezzo del gas
    'nonce': nonce
})

# Firma la transazione con la private key
signed_tx_add = w3.eth.account.sign_transaction(tx_add, private_key=private_key)

# Invia la transazione sulla blockchain
tx_hash_add = w3.eth.send_raw_transaction(signed_tx_add.raw_transaction)

# Aspetta il receipt della transazione per conferma
receipt_add = w3.eth.wait_for_transaction_receipt(tx_hash_add)
print(f"📖 Libro aggiunto: {tx_hash_add.hex()}")

# =======================
# 2️⃣ Compra libro
# =======================
# Incrementa il nonce per la nuova transazione
nonce += 1

# Costruisci la transazione per comprare il libro
tx_buy = contract.functions.buyBook(book_id).build_transaction({
    'from': user["wallet_address"],
    'value': price_wei,             # Invio l'ETH al contratto
    'gas': 200000,
    'gasPrice': w3.to_wei('50', 'gwei'),
    'nonce': nonce
})

# Firma la transazione di acquisto
signed_tx_buy = w3.eth.account.sign_transaction(tx_buy, private_key=private_key)

# Invia la transazione sulla blockchain
tx_hash_buy = w3.eth.send_raw_transaction(signed_tx_buy.raw_transaction)

# Aspetta conferma
receipt_buy = w3.eth.wait_for_transaction_receipt(tx_hash_buy)
print(f"💰 Libro comprato: {tx_hash_buy.hex()}")

# =======================
# 3️⃣ Salvataggio su MongoDB
# =======================
# Placeholder: URI del tuo MongoDB Atlas o locale
# Carica le variabili dal .env
load_dotenv()

# Prendi l'URI dal .env
MONGO_URI = os.getenv("MONGO_URI")

# Connessione a MongoDB
client = MongoClient(MONGO_URI)
db = client["booksDB"]
collection = db["transactions"]

# Dati da salvare nel DB
tx_data = {
    "tx_hash": tx_hash_buy.hex(),
    "user": user,
    "book": book,
    "amount": amount_eth,
    "currency": "ETH",
    "status": "completed" if receipt_buy.status == 1 else "failed",
    "timestamp": datetime.utcnow().isoformat() + "Z"
}

collection.insert_one(tx_data)
print("✅ Transazione salvata su MongoDB")