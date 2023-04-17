//require solidity-coverage
require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */

const CHAIN_IDS = {
  hardhat: 31337, // chain ID for hardhat testing
};

module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: CHAIN_IDS.hardhat,
      forking: {
        // Using Alchemy
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`, // url to RPC node, ${ALCHEMY_KEY} - must be your API key
        httpHeaders: {
          Authorization: `Bearer ${process.env.ALCHEMY_KEY}`,
        },
        blockNumber: 14390000, // a specific block number with which you want to work
      },
    },
    // bsctest: {
    //   url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    //   accounts: [process.env.PRIVATE_KEY],
    // },
  },
  // etherscan: {
  //   apiKey: process.env.API_KEY,
  // },
};
