import assert from "node:assert/strict";

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
  });

  it("Should allow buying a book from a different account", async () => {
    await contract.addBook(bookId, "978-3-16-148410-0", priceWei);

    const contractBuyer = contract.connect(buyer);
    const tx = await contractBuyer.buyBook(bookId, { value: priceWei });
    await tx.wait();

    const book = await contract.books(bookId);
    assert.equal(book.owner, await buyer.getAddress());
    assert.equal(book.sold, true);
  });

  it("Should revert if buyer sends insufficient Ether", async () => {
  await contract.addBook(bookId, "978-3-16-148410-0", priceWei);

  const contractBuyer = contract.connect(buyer);

  await assert.rejects(
    contractBuyer.buyBook(bookId, { value: ethers.parseEther("0.001") }),
    /Ether insufficiente/   // ora corrisponde al tuo require
  );
});

it("Should revert if the book is already sold", async () => {
  await contract.addBook(bookId, "978-3-16-148410-0", priceWei);

  const contractBuyer = contract.connect(buyer);
  await contractBuyer.buyBook(bookId, { value: priceWei });

  await assert.rejects(
    contractBuyer.buyBook(bookId, { value: priceWei }),
    /Libro gia' venduto/  // ora corrisponde al tuo require
  );
});

it("Should transfer Ether to the seller after purchase", async () => {
  await contract.addBook(bookId, "978-3-16-148410-0", priceWei);

  // Bilancio del venditore prima della vendita (BigInt)
  const sellerBalanceBefore = await ethers.provider.getBalance(await owner.getAddress());

  const contractBuyer = contract.connect(buyer);
  const tx = await contractBuyer.buyBook(bookId, { value: priceWei });
  await tx.wait();

  // Bilancio del venditore dopo la vendita (BigInt)
  const sellerBalanceAfter = await ethers.provider.getBalance(await owner.getAddress());

  // Confronto convertendo priceWei in BigInt
  assert(
    sellerBalanceAfter === sellerBalanceBefore + priceWei,
    "Il bilancio del venditore deve aumentare esattamente del prezzo del libro"
  );
});



});
