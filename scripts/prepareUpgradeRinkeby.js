// scripts/prepare_upgrade.js
async function main() {
  const NFTIMESHARE_V1 = "0xe4aA8DE6adea71Aab6db1dEB2a34afDCc19ce295";
  const NFTIMESHAREMONTH_V1 = "0x1909E978C0d4BC90D93bbD1CC367297d2bea1b2F";

  const NFTimeshare = await ethers.getContractFactory("NFTimeshare");
  //const nftimeshare = await NFTimeshare.deploy();
  console.log("Preparing upgrade...");
  const nftimeshare_addr = await upgrades.prepareUpgrade(NFTIMESHARE_V1, NFTimeshare);
  console.log("NFTimeshare deployed to ", nftimeshare_addr);

  const NFTimeshareMonth = await ethers.getContractFactory("NFTimeshareMonth");
  //const nftimesharemonth = await NFTimeshareMonth.deploy();
  console.log("Preparing upgrade...");
  const nftimesharemonth_addr = await upgrades.prepareUpgrade(NFTIMESHAREMONTH_V1, NFTimeshareMonth);
  console.log("NFTimeshareMonth deployed to ", nftimesharemonth_addr)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
