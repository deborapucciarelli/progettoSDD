from flask import Flask, request, jsonify
from datetime import datetime
from operazioniCrud import add_book  # import della funzione dal tuo CRUD

app = Flask(__name__)

# Endpoint per aggiungere un libro
@app.route("/add_book", methods=["POST"])
def add_book_endpoint():
    data = request.json

    # Controlla che ci sia walletAddress
    wallet_address = data.get("walletAddress")
    username = data.get("username")
    if not wallet_address or not username:
        return jsonify({"error": "walletAddress o username mancante"}), 400

    # Dati libro
    title = data.get("title")
    isbn = data.get("isbn")
    author = data.get("author", "")
    publisher = data.get("publisher", "")
    year = int(data.get("year", 0))
    image_url = data.get("imageUrl", "")
    usato = bool(data.get("usato", False))

    # Chiamata alla funzione CRUD
    try:
        inserted_id = add_book(
            isbn=isbn,
            title=title,
            author=author,
            year=year,
            publisher=publisher,
            image_url=image_url,
            usato=usato,
            username=username,
            wallet_address=wallet_address
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({"success": True, "inserted_id": str(inserted_id)}), 201

if __name__ == "__main__":
    app.run(debug=True, port=5000)
