// This is an exmaple test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");
/*const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');*/

describe("NFTimeshare and NFTimeshareMonths contract", function () {
  let NFTimeshare;
  let NFTimeshareMonth;
  let TestNFT;
  let hhTimeshare;
  let hhTimeshareMonth;
  let hhTestNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    NFTimeshare      = await ethers.getContractFactory("NFTimeshare");
    NFTimeshareMonth = await ethers.getContractFactory("NFTimeshareMonth")
    TestNFT          = await ethers.getContractFactory("TestNFT");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hhTimeshare      = await NFTimeshare.deploy();
    hhTimeshareMonth = await NFTimeshareMonth.deploy();
    hhTestNFT        = await TestNFT.deploy();

    await hhTimeshare.deployed();
    await hhTimeshareMonth.deployed();
    await hhTestNFT.deployed();

    // set links between Timeshare and TimeshareMonths
    await hhTimeshare.setNFTimeshareMonthAddress(hhTimeshareMonth.address);
    await hhTimeshareMonth.setNFTimeshareAddress(hhTimeshare.address);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {

    it("Should have configured linkages between contracts", async function() {
      expect(await hhTimeshare.getNFTimeshareMonthAddress()).
        to.equal(hhTimeshareMonth.address);
    });
    it("Should have configured reverse link too", async function() {
      expect(await hhTimeshareMonth.getNFTimeshareAddress()).
      to.equal(hhTimeshare.address);
    });
    it("Shouldn't update linkages from non-owners", async function() {
      let addr1TS = hhTimeshare.connect(addr1);
      let addr1TSM = hhTimeshareMonth.connect(addr1);
      expect(addr1TS.setNFTimeshareMonthAddress(addr1TSM.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    })
  });



});
