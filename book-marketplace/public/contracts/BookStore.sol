// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BookStore {
    struct Book {
        string isbn;
        address owner; // wallet address del venditore
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
        require(book.owner != address(0), "Libro non registrato");

        address payable seller = payable(book.owner);

        // segna come venduto
        book.sold = true;
        book.owner = msg.sender; // ora il nuovo owner è l'acquirente

        // paga il venditore
        (bool success, ) = seller.call{value: book.price}("");
        require(success, "Pagamento al venditore fallito");

        // rimborsa eventuale eccedenza
        if (msg.value > book.price) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - book.price}("");
            require(refundSuccess, "Rimborso fallito");
        }

        emit BookBought(bookId, msg.sender, book.price);
    }
}