// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BookStore is ReentrancyGuard {
    struct Book {
        string id;          // ISBN_username_dataCreazione
        address seller;     // chi ha listato
        address buyer;      // compratore (dopo l’acquisto)
        uint256 price;      // prezzo in wei
        bool sold;
        bool exists;
    }

    mapping(string => Book) private books;
    mapping(address => uint256) public proceeds; // saldo ritirabile dal venditore

    event BookListed(string indexed bookId, address indexed seller, uint256 price);
    event BookBought(string indexed bookId, address indexed seller, address indexed buyer, uint256 amount);
    event ProceedsWithdrawn(address indexed seller, uint256 amount);

    /// Aggiunge un libro in vendita
    function listBook(string calldata bookId, uint256 price) external {
        require(bytes(bookId).length > 0, "bookId vuoto");
        require(price > 0, "prezzo deve essere > 0");
        Book storage b = books[bookId];
        require(!b.exists, "book gia' listato");

        books[bookId] = Book({
            id: bookId,
            seller: msg.sender,
            buyer: address(0),
            price: price,
            sold: false,
            exists: true
        });

        emit BookListed(bookId, msg.sender, price);
    }

    /// Acquista un libro già listato
    function buyBook(string calldata bookId) external payable nonReentrant {
        Book storage b = books[bookId];
        require(b.exists, "book non esiste");
        require(!b.sold, "gia' venduto");
        require(msg.value == b.price, "prezzo errato");

        b.buyer = msg.sender;
        b.sold = true;

        proceeds[b.seller] += msg.value;

        emit BookBought(bookId, b.seller, msg.sender, msg.value);
    }

    /// Il venditore ritira i fondi accumulati
    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "nessun saldo");
        proceeds[msg.sender] = 0;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "withdraw fallito");

        emit ProceedsWithdrawn(msg.sender, amount);
    }

    /// Getter per la UI
    function getBook(string calldata bookId) external view returns (Book memory) {
        return books[bookId];
    }
}
