import "@nomicfoundation/hardhat-toolbox";

export default {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545", // porta di Ganache GUI (oppure 8545 se CLI)
      accounts: [
        "0x0f483c9b300aff4702a11227d749ced97d09bd6ddab66a6cdd808187051371ab", // prendi una delle private key da Ganache
      ],
    },
  },
};
