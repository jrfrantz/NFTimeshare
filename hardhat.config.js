require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');

const { alchemyApiKey, mnemonic, ETHERSCAN_API_KEY } = require('./secrets.json');

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {version: "0.7.3"},
      {version: "0.8.4"},
      {version: "0.4.16"}
    ],
  },
  networks: {
     rinkeby: {
       url: `${alchemyApiKey}`,
       accounts: {mnemonic: mnemonic}
     }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }

};
