import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  // Ottieni il contract factory
  const BookStore = await ethers.getContractFactory("BookStore");

  // Deploy del contratto
  const marketplace = await BookStore.deploy();

  // In ethers v6, il deploy è già pronto dopo la promise
  console.log("Marketplace deployed to:", marketplace.target);
}

// Esegui la funzione main e cattura errori
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
