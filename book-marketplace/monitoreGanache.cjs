const { ethers } = require("ethers");

// Connetti al nodo Ganache
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Lista degli account da monitorare (puoi aggiungerne altri)
const accounts = [
    "0x0a578acd9291a13440ec02f0dd0c67673003a9ac", // venditore
    "0xdc42098bb91898ec2f419857c916cc78c23301da"  // acquirente
];

// Funzione per stampare i saldi
async function printBalances() {
    console.log("----- Saldi account Ganache -----");
    for (const addr of accounts) {
        const balance = await provider.getBalance(addr);
        console.log(addr, ":", ethers.formatEther(balance), "ETH");
    }
    console.log("--------------------------------\n");
}

// Monitora ogni nuovo blocco
provider.on("block", async (blockNumber) => {
    console.log("Nuovo blocco:", blockNumber);
    await printBalances();
});

// Stampa saldi iniziali
printBalances();
