// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BookStore {
    struct Book {
        string isbn;
        string owner; // wallet address come stringa
        uint256 price; // prezzo in wei
        bool sold;
    }

    mapping(string => Book) public books; // chiave: isbn + username + DataCreazione

    event BookBought(string bookId, address buyer, uint256 amount);

    // Aggiungi un libro al contratto (solo per test)
    function addBook(string memory bookId, uint256 price) public {
        books[bookId] = Book({
            isbn: bookId,
            owner: "",
            price: price,
            sold: false
        });
    }

    // Compra un libro
    function buyBook(string memory bookId) public payable {
        Book storage book = books[bookId];
        require(!book.sold, "Libro gia' venduto");
        require(msg.value >= book.price, "Ether insufficiente");

        book.owner = msg.sender;
        book.sold = true;

        emit BookBought(bookId, msg.sender, msg.value);
    }
}
