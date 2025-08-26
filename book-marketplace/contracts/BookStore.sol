// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BookStore {
    struct Book {
        string isbn;
        address owner; // wallet address
        uint256 price; // prezzo in wei
        bool sold;
    }

    mapping(string => Book) public books; // chiave: isbn + username + DataCreazione

    event BookBought(string bookId, address buyer, uint256 amount);

    // Compra un libro
    function buyBook(string memory bookId) public payable {
        Book storage book = books[bookId];
        require(!book.sold, "Libro gia' venduto");
        require(msg.value >= book.price, "Ether insufficiente");
        require(book.owner != msg.sender, "Non puoi comprare il tuo libro");

        book.owner = msg.sender;
        book.sold = true;

        // Rimborsa eventuale eccedenza
        if(msg.value > book.price) {
            payable(msg.sender).transfer(msg.value - book.price);
        }

        emit BookBought(bookId, msg.sender, book.price);
    }
}
