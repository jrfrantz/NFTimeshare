const { ethers, upgrades } = require("hardhat");


// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const NFTimeshare = await ethers.getContractFactory("NFTimeshare");
  //const nftimeshare = await NFTimeshare.deploy();
  const nftimeshare = await upgrades.deployProxy(NFTimeshare, []);
  await nftimeshare.deployed();

  const NFTimeshareMonth = await ethers.getContractFactory("NFTimeshareMonth");
  //const nftimesharemonth = await NFTimeshareMonth.deploy();
  const nftimesharemonth = await upgrades.deployProxy(NFTimeshareMonth, []);
  await nftimesharemonth.deployed();

  console.log("NFTimeshare addr:", nftimeshare.address);
  console.log("NFTimeshareMonth addr:", nftimesharemonth.address);
  console.log("parent directory is ", __dirname);

  // set links between Timeshare and TimeshareMonths
  await nftimeshare.setNFTimeshareMonthAddress(nftimesharemonth.address);
  await nftimesharemonth.setNFTimeshareAddress(nftimeshare.address);

  // We also save the contract's artifacts and address in the frontend directory
  const metadataDir = "/../metadata-api-nodejs/src/contracts";
  const dappDir     = "/../dapp/src/contracts";
  saveFrontendFiles([nftimeshare, nftimesharemonth], metadataDir);
  saveFrontendFiles([nftimeshare, nftimesharemonth], dappDir);
}

function saveFrontendFiles(tokens, location) {
  const fs = require("fs");
  const contractsDir = __dirname + location;
  const [nftimeshare, nftimesharemonth, ...rest] = tokens;

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const contractsJSON = {
    NFTimeshare: nftimeshare.address,
    NFTimeshareMonth: nftimesharemonth.address
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify(contractsJSON, undefined, 2)
  );

  const NFTimeshareArtifact = artifacts.readArtifactSync("NFTimeshare");
  const NFTimeshareMonthArtifact = artifacts.readArtifactSync("NFTimeshareMonth");

  fs.writeFileSync(
    contractsDir + "/NFTimeshare.json",
    JSON.stringify(NFTimeshareArtifact, null, 2)
  );
  fs.writeFileSync(
    contractsDir + "/NFTimeshareMonth.json",
    JSON.stringify(NFTimeshareMonthArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
