import "@nomicfoundation/hardhat-toolbox";

export default {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545", // porta di Ganache GUI (oppure 8545 se CLI)
      accounts: [
        "0x0f483c9b300aff4702a11227d749ced97d09bd6ddab66a6cdd808187051371ab",
        "0xb5f8fb2fce08bca9d99293783079d3329c8bc82693e98e2c3f2fcfdc8ef1cb0b" // prendi una delle private key da Ganache
      ],
    },
  },
};
