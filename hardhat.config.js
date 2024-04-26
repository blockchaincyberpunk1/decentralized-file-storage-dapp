// Hardhat plugins
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("dotenv").config();

/**
 * Hardhat configuration for the project.
 */
module.exports = {
  /**
   * Solidity compiler configuration.
   */
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  /**
   * Network configuration for deploying the contracts.
   */
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },

  /**
   * Configuration for the gas reporter plugin.
   */
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: process.env.GAS_REPORT_FILE,
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
  },
};