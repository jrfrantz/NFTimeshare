const { ethers } = require("ethers");
const TokenArtifact = require("./src/contracts/Token.json");
const NFTimeshareArtifact = require("./src/contracts/NFTimeshare.json");
const contractAddress = require("./src/contracts/contract-address.json");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider();
  const blocknum = await provider.getBlockNumber();

  var nftimeshare = new ethers.Contract(
    contractAddress.NFTimeshare,
    NFTimeshareArtifact.abi,
    provider.getSigner()
  );
  console.log(nftimeshare);
}

main();
