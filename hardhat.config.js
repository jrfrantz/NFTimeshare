require("@nomiclabs/hardhat-waffle");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
require('@openzeppelin/hardhat-upgrades');

const { alchemyApiKey, mnemonic } = require('./secrets.json');

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

};
