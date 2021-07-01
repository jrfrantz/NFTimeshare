const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time
} = require('@openzeppelin/test-helpers');
const contractAddresses = require("../frontend/src/contracts/contract-address.json");
describe("Upgrading smart contracts", function() {
  let TestNFT;
  let TestNFTv2;
  let hhTestNFT;
  let hhTestNFTv2;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;
  let externalTokenId;

  beforeEach(async function () {
    TestNFT = await ethers.getContractFactory("TestNFT");
    //hhTestNFT = TestNFT.attach(contractAddresses.TestNFT);
    //console.log(hhTestNFT);
    TestNFTv2 = await ethers.getContractFactory("TestNFT");
    hhTestNFTv2 = await upgrades.upgradeProxy(
      hhTestNFT.address,
      TestNFTv2
    );
    console.log("Upgraded");
    console.log(hhTestNFTv2.address);
  });
  describe("confirm the deploy worked", async function() {
    it("Should have deployed a new instance", async function() {
      expect(hhTestNFT.address).to.not.equal(hhTestNFTv2.address);
    });
    it("Should still work though", async function() {
      await hhTestNFTv2.awardTestNFT();
      expect(await hhTestNFTv2.totalSupply()).to.equal(1);
    });
  });
})
