// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BookStore {
    struct Book {
        string isbn;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(string => Book) public books;

    event BookAdded(string bookId, address owner, uint256 price);
    event BookBought(string bookId, address buyer, uint256 amount);
    event BookRemoved(string bookId, address owner);

    // Event di debug per controllare valori interni
    event Debug(string msg, address addr, uint256 value);

    bool private _entered;
    modifier nonReentrant() {
        require(!_entered, "Reentrancy");
        _entered = true;
        _;
        _entered = false;
    }

    function addBook(string memory bookId, string memory isbn, uint256 price) public {
        require(bytes(bookId).length > 0, "bookId vuoto");
        require(bytes(isbn).length > 0, "isbn vuoto");
        require(books[bookId].owner == address(0), "Libro gia' registrato");
        require(price > 0, "Prezzo deve essere > 0");

        books[bookId] = Book({
            isbn: isbn,
            owner: payable(msg.sender),
            price: price,
            sold: false
        });

        emit BookAdded(bookId, msg.sender, price);
    }

    function buyBook(string memory bookId) public payable nonReentrant {
        Book storage book = books[bookId];

        require(book.owner != address(0), "Libro non registrato");
        require(!book.sold, "Libro gia' venduto");
        require(msg.value >= book.price, "Ether insufficiente");
        require(book.owner != msg.sender, "Non puoi comprare il tuo libro");

        emit Debug("Acquirente msg.sender", msg.sender, msg.value);
        emit Debug("Prezzo libro", book.owner, book.price);

        address payable seller = book.owner;

        // Effetti prima delle interazioni (pattern CEI)
        book.sold = true;
        book.owner = payable(msg.sender);

        // Pagamento venditore
        (bool success, ) = seller.call{value: book.price}("");
        emit Debug("Tentativo pagamento venditore", seller, book.price);
        if (!success) {
            emit Debug("Pagamento fallito!", seller, book.price);
        } else {
            emit Debug("Pagamento riuscito", seller, book.price);
        }

        // Rimborso eccedenza
        uint256 excess = msg.value - book.price;
        if (excess > 0) {
            (bool refundOk, ) = msg.sender.call{value: excess}("");
            emit Debug("Tentativo rimborso eccedenza", msg.sender, excess);
            if (!refundOk) {
                emit Debug("Rimborso fallito!", msg.sender, excess);
            } else {
                emit Debug("Rimborso riuscito", msg.sender, excess);
            }
        }

        emit BookBought(bookId, msg.sender, book.price);
    }

    function removeBook(string memory bookId) external {
        Book storage book = books[bookId];
        require(book.owner != address(0), "Libro non registrato");
        require(!book.sold, "Libro gia' venduto");
        require(book.owner == msg.sender, "Non sei il proprietario");

        address ownerBefore = book.owner;
        delete books[bookId];

        emit BookRemoved(bookId, ownerBefore);
    }

    function getBook(string memory bookId)
        external
        view
        returns (string memory isbn, address owner, uint256 price, bool sold)
    {
        Book storage b = books[bookId];
        require(b.owner != address(0), "Libro non registrato");
        return (b.isbn, b.owner, b.price, b.sold);
    }

    function isBookAvailable(string memory bookId) external view returns (bool) {
        Book storage b = books[bookId];
        return (b.owner != address(0) && !b.sold);
    }
}
