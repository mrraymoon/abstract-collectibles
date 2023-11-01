require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const privateKey = process.env.PRIVATEKEY;
if (!privateKey) {
  throw new Error("Please set your privateKey in a .env file");
}

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [privateKey],
      chainId: 44787,
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};
