// This is an exmaple test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

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
  let externalTokenId;

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

    // non-owners calling contract
    tTimeshareMonth = hhTimeshareMonth.connect(addr1);
    tTimeshare      = hhTimeshare.connect(addr1);
    tExternalNFT    = hhTestNFT.connect(addr1);

    await tExternalNFT.awardTestNFT();
    externalTokenId = await tExternalNFT.tokenOfOwnerByIndex(addr1.address, 0);
  });

  describe("Deployment", function () {
    it("Should have configured linkages between contracts", async function() {
      expect(await hhTimeshare.getNFTimeshareMonthAddress()).
        to.equal(hhTimeshareMonth.address);
    });
    it("Should have configured reverse link too", async function() {
      expect(await hhTimeshareMonth.getNFTimeshareAddress()).
      to.equal(hhTimeshare.address);
    });
    it("Should not have null linkages", async function() {
      expect(hhTimeshare.address).to.not.equal(constants.ZERO_ADDRESS);
    });
    it("Shouldn't update linkages from non-owners", async function() {
      let addr1TS = hhTimeshare.connect(addr1);
      let addr1TSM = hhTimeshareMonth.connect(addr1);
      expect(addr1TS.setNFTimeshareMonthAddress(addr1TSM.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    })
    it("Should have made the right token in setup", async function() {
      expect(await tExternalNFT.tokenByIndex(0)).to.equal(1);
    })
    it("Should have awarded addr1 an NFT", async function() {
      expect(await tExternalNFT.balanceOf(addr1.address))
      .to.equal(1);
    })
  });

  describe("Deposits", function() {
    let timeshareTokenId;
    let monthTokenIds;
    beforeEach(async function() {
      await tExternalNFT.approve(tTimeshare.address, 1);
      await tTimeshare.deposit(
        tExternalNFT.address,
        externalTokenId,
        addr1.address,
        addr1.address,
      );
      timeshareTokenId = await tTimeshare.getTokenIdForUnderlyingNFT(
        tExternalNFT.address,
        externalTokenId
      );
      monthTokenIds = await tTimeshareMonth.getTimeshareMonths(timeshareTokenId);
    });

    it("Should make 12 monthTokens", async function() {
      expect(monthTokenIds.length).to.equal(12);
    });

    it("Should now be owned/wrapped by contract", async function() {
      var newOwner = await tExternalNFT.ownerOf(externalTokenId);
      expect(newOwner).to.equal(tTimeshare.address);
    })
    it("Should distribute assets to owner", async function() {
      expect(await tTimeshareMonth.totalSupply()).to.equal(12);
      expect(await tTimeshareMonth.balanceOf(addr1.address))
      .to.equal(12);
    });

    it("Should return URIs from NFTimeshareMonths", async function() {
      var timeshareURI = await tTimeshare.tokenURI(timeshareTokenId);
      var timeshareMonthURI = await tTimeshareMonth.tokenURI(monthTokenIds[0]);
      var wrappedURI = await tExternalNFT.tokenURI(externalTokenId);
      expect(timeshareURI).to.equal(timeshareMonthURI);
      expect(timeshareURI).to.not.equal("");
      expect(wrappedURI).to.equal(timeshareURI);
    });

    it("Shouldn't allow any transfers of wrapped asset", async function() {
      expect(tTimeshare.deposit(
        tExternalNFT.address,
        externalTokenId,
        addr1.address,
        addr1.address
      )).to.be.revertedWith("ERC721: transfer of token that is not own");
    });

    it("Shouldn't allow any approvals of wrapped asset", async function() {
      expect(tExternalNFT.approve(addr2.address, externalTokenId))
      .to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");
    });

    it("Shouldn't allow transfers of NFTimeshares", async function() {
      expect(tTimeshare.transferFrom(
        tTimeshare.address,
        addr2.address,
        timeshareTokenId
      )).to.be.revertedWith("Disallowed operation on NFTimeshare") // overrideen method should simply return
    });

    it("Shouldn't allow repeat deposits of underlying NFT", async function() {
      expect(tTimeshare.deposit(
        tExternalNFT.address,
        externalTokenId,
        addr1.address,
        addr1.address
      )).to.be.revertedWith("")
    });
    it("Should allow non-owners to deposit if operator", async function() {
      await tExternalNFT.awardTestNFT();
      var externalToken2 = await tExternalNFT.tokenOfOwnerByIndex(
        addr1.address, 0
      );
      await tExternalNFT.setApprovalForAll(addr2.address, true);
      var addr2ExternalNFT    = tExternalNFT.connect(addr2);
      var addr2Timeshare      = tTimeshare.connect(addr2);
      var addr2TimeshareMonth = tTimeshareMonth.connect(addr2);

      await addr2ExternalNFT.approve(addr2Timeshare.address, externalToken2);
      await addr2Timeshare.deposit(
        tExternalNFT.address,
        externalToken2,
        addr1.address,
        addr2.address
      );

      expect(await addr2TimeshareMonth.balanceOf(addr2.address)).to.equal(12);
    });
  });

  describe("ERC721 TimeshareMonths", function() {
    let timeshareTokenId;
    let monthTokenIds;
    beforeEach(async function() {
      await tExternalNFT.approve(tTimeshare.address, 1);
      await tTimeshare.deposit(
        tExternalNFT.address,
        externalTokenId,
        addr1.address,
        addr1.address,
      );
      timeshareTokenId = await tTimeshare.getTokenIdForUnderlyingNFT(
        tExternalNFT.address,
        externalTokenId
      );
      monthTokenIds = await tTimeshareMonth.getTimeshareMonths(timeshareTokenId);
    });

    xit("Should be able to trade months", async function() {});
    xit("Should be able to approve months", async function() {});
    xit("Should update owners each month", async function() {});
    xit("Should wrap around December", async function() {});
  });

});
