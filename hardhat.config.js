require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');

const { RINKEBY_ALCHEMY_KEY_URL, RINKEBY_MNEMONIC, ETHERSCAN_API_KEY } = require('./secrets.json').rinkeby;

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
       url: `${RINKEBY_ALCHEMY_KEY_URL}`,
       accounts:
        { mnemonic: RINKEBY_MNEMONIC}
     }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }

};
