from web3 import Web3
import json

# =======================
# Connessione nodo
# =======================
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))  # Ganache locale
# w3 = Web3(Web3.HTTPProvider("https://goerli.infura.io/v3/YOUR_PROJECT_ID")) # testnet

assert w3.is_connected, "❌ Nodo non connesso!"

# =======================
# ABI e indirizzo contratto
# =======================
contract_address = "0x...IL_TUO_CONTRACT_ADDRESS..."  
abi = json.load(open("BookStoreABI.json"))  # ABI generata da compile

contract = w3.eth.contract(address=contract_address, abi=abi)

# =======================
# Dati test
# =======================
book_id = "9781234567890_mary_2025-08-20T12:00:00"  # esempio con ISBN + username + DataCreazione
price_eth = 0.01  # prezzo in ETH

my_wallet = "0xTUO_WALLET_ADDRESS"
private_key = "TUO_PRIVATE_KEY"  # ATTENZIONE: solo test, non mettere mai su mainnet reale

# =======================
# Crea transazione
# =======================
nonce = w3.eth.get_transaction_count(my_wallet)

tx = contract.functions.buyBook(book_id).buildTransaction({
    'from': my_wallet,
    'value': w3.toWei(price_eth, 'ether'),
    'gas': 200000,
    'gasPrice': w3.toWei('50', 'gwei'),
    'nonce': nonce
})

# Firma transazione
signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)

# Invia transazione
tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
print(f"Transazione inviata: {tx_hash.hex()}")

# Attendi conferma
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print(f"Transazione confermata: {receipt.transactionHash.hex()}")
