import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import pkg from "hardhat";
import fs from "fs";
import path from "path";

const { ethers } = pkg;

// File di output dei risultati
const outputFile = path.join(process.cwd(), "test-results.txt");

// Funzione helper per loggare su console e file
function logResult(msg) {
  console.log(msg);
  fs.appendFileSync(outputFile, msg + "\n");
}

// Pulizia file all’avvio
fs.writeFileSync(outputFile, "📚 Risultati dei test BookStore\n\n");

describe("BookStore contract on Ganache", function () {
  let BookStore;
  let contract;
  let owner;
  let buyer;
  let bookId = "1234567890";
  let priceEth = "0.01";
  let priceWei;

  beforeEach(async () => {
    [owner, buyer] = await ethers.getSigners();

    BookStore = await ethers.getContractFactory("BookStore", owner);
    contract = await BookStore.deploy();
    await contract.waitForDeployment();

    priceWei = ethers.parseEther(priceEth);
  });

  it("Should add a book correctly", async () => {
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);
    const book = await contract.books(bookId);

    assert.equal(book.isbn, "978-3-16-148410-0");
    assert.equal(book.owner, await owner.getAddress());
    assert.equal(book.price.toString(), priceWei.toString());
    assert.equal(book.sold, false);

    logResult("✓ Test 'addBook' passato ✅");
  });

  it("Should allow buying a book from a different account", async () => {
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);
    const contractBuyer = contract.connect(buyer);
    await contractBuyer.buyBook(bookId, { value: priceWei });

    const book = await contract.books(bookId);
    assert.equal(book.owner, await buyer.getAddress());
    assert.equal(book.sold, true);

    logResult("✓ Test 'buyBook (buyer diverso)' passato ✅");
  });

  it("Should not allow buying own book", async () => {
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);

    let errorCaught = false;
    try {
      await contract.buyBook(bookId, { value: priceWei });
    } catch (e) {
      errorCaught = true;
    }
    assert.equal(errorCaught, true);

    logResult("✓ Test 'buyBook (owner non può comprare)' passato ✅");
  });

  it("Should not allow buying with insufficient Ether", async () => {
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);
    const contractBuyer = contract.connect(buyer);

    let errorCaught = false;
    try {
      await contractBuyer.buyBook(bookId, { value: ethers.parseEther("0.001") });
    } catch (e) {
      errorCaught = true;
    }
    assert.equal(errorCaught, true);

    logResult("✓ Test 'buyBook (ether insufficiente)' passato ✅");
  });

  it("Should not allow removing a sold book", async () => {
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);
    const contractBuyer = contract.connect(buyer);
    await contractBuyer.buyBook(bookId, { value: priceWei });

    let errorCaught = false;
    try {
      await contract.removeBook(bookId);
    } catch (e) {
      errorCaught = true;
    }
    assert.equal(errorCaught, true);

    logResult("✓ Test 'removeBook (libro venduto)' passato ✅");
  });

  it("Should not allow a non-owner to remove the book", async () => {
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);
    const contractBuyer = contract.connect(buyer);

    let errorCaught = false;
    try {
      await contractBuyer.removeBook(bookId);
    } catch (e) {
      errorCaught = true;
    }
    assert.equal(errorCaught, true);

    logResult("✓ Test 'removeBook (non owner)' passato ✅");
  });
});
