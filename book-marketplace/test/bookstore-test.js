import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import pkg from "hardhat";
const { ethers } = pkg;

describe("BookStore contract on Ganache", function () {
  let BookStore;
  let contract;
  let owner;
  let buyer;
  let bookId = "1234567890";
  let priceEth = "0.01";
  let priceWei;

  beforeEach(async () => {
    // Ottieni gli account di Hardhat
    [owner, buyer] = await ethers.getSigners();

    // Deploy del contratto
    BookStore = await ethers.getContractFactory("BookStore", owner);
    contract = await BookStore.deploy();
    await contract.waitForDeployment();

    priceWei = ethers.parseEther(priceEth);
  });

  it("Should add a book correctly", async () => {
    // Owner aggiunge il libro
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);

    const book = await contract.books(bookId);
    assert.equal(book.isbn, "978-3-16-148410-0");
    assert.equal(book.owner, await owner.getAddress());
    assert.equal(book.price.toString(), priceWei.toString());
    assert.equal(book.sold, false);
  });

  it("Should allow buying a book from a different account", async () => {
    // Owner aggiunge il libro
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);

    // Buyer compra il libro
    const contractBuyer = contract.connect(buyer);
    const tx = await contractBuyer.buyBook(bookId, { value: priceWei });
    await tx.wait();

    const book = await contract.books(bookId);
    assert.equal(book.owner, await buyer.getAddress());
    assert.equal(book.sold, true);
  });
});