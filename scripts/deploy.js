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

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.deployed();


  /*
  const timeLibrary = await deploy("BokkyPooBahsDateTimeLibrary", {
      from: <deployer>
  });
  */

  const NFTimeshare = await ethers.getContractFactory("NFTimeshare");
  const nftimeshare = await NFTimeshare.deploy();
  /*
  const example = await deploy("Example", {
    from: <deployer>
    args: ["example string argument for the 'Example' contract constructor"],
    libraries: {
        ExampleLibrary: exampleLibrary.address
    }
});
  */
  await nftimeshare.deployed();

  const NFTimeshareMonth = await ethers.getContractFactory("NFTimeshareMonth");
  const nftimesharemonth = await NFTimeshareMonth.deploy();
  await nftimesharemonth.deployed();

  console.log("Token address:", token.address);
  console.log("NFTimeshare addr:", nftimeshare.address);
  console.log("NFTimeshareMonth addr:", nftimesharemonth.address);

  // set links between Timeshare and TimeshareMonths
  await nftimeshare.setNFTimeshareMonthAddress(nftimesharemonth.address);
  await nftimesharemonth.setNFTimeshareAddress(nftimeshare.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token);
}

function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    contractsDir + "/Token.json",
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
