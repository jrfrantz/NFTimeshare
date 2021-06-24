// This is an exmaple test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
// TODO: delete all the Token.sol and Token.js files
const { expect } = require("chai");
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time
} = require('@openzeppelin/test-helpers');

const THIRTY_DAYS_IN_SECONDS = 30*24*60*60;

async function increaseTime(addlSeconds) {
  var blockNum;
  var lastBlock;

  blockNum = await ethers.provider.getBlockNumber();
  lastBlock = await ethers.provider.getBlock(blockNum)

  await ethers.provider.send("evm_increaseTime", [addlSeconds]);
  await ethers.provider.send("evm_mine");

  blockNum = await ethers.provider.getBlockNumber();
  lastBlock = await ethers.provider.getBlock(blockNum);
  return lastBlock.timestamp;
}

async function getLastBlockTime() {
  var blockNum = await ethers.provider.getBlockNumber();
  return (await ethers.provider.getBlock(blockNum)).timestamp;
}

async function setTime(seconds) {
  var curTime = await getLastBlockTime();
  //console.log("Simple diff is ", seconds - curTime)
  return await increaseTime(seconds - curTime);
}

describe("NFTimeshare and NFTimeshareMonths contract", function () {
  let NFTimeshare;
  let NFTimeshareMonth;
  let TestNFT;
  let BokkyPooBahsDateTimeLibrary;
  let hhTimeshare;
  let hhTimeshareMonth;
  let hhTestNFT;
  let bokkyPooBahsDateTimeLibrary;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;
  let externalTokenId;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    NFTimeshare      = await ethers.getContractFactory("NFTimeshare");
    NFTimeshareMonth = await ethers.getContractFactory("NFTimeshareMonth")
    TestNFT          = await ethers.getContractFactory("TestNFT");
    BokkyPooBahsDateTimeLibrary = await ethers.getContractFactory("BokkyPooBahsDateTimeLibrary");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hhTimeshare      = await NFTimeshare.deploy();
    hhTimeshareMonth = await NFTimeshareMonth.deploy();
    hhTestNFT        = await TestNFT.deploy();
    bokkyPooBahsDateTimeLibrary = await BokkyPooBahsDateTimeLibrary.deploy();
    //console.log(bokkyPooBahsDateTimeLibrary);

    await hhTimeshare.deployed();
    await hhTimeshareMonth.deployed();
    await hhTestNFT.deployed();
    await bokkyPooBahsDateTimeLibrary.deployed();

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
    let addr2TimeshareMonth;
    let addr2Timeshare;
    let addr2ExternalNFT;
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

      addr2TimeshareMonth = tTimeshareMonth.connect(addr2);
      addr2Timeshare      = tTimeshare.connect(addr2);
      addr2ExternalNFT    = tExternalNFT.connect(addr2);
    });

    it("Should be able to trade months", async function() {
      var oldOwner = await tTimeshareMonth.ownerOf(monthTokenIds[11]);
      await tTimeshareMonth.transferFrom(
        addr1.address,
        addr2.address,
        monthTokenIds[11]
      );
      var newOwner = await tTimeshareMonth.ownerOf(monthTokenIds[11]);
      expect(oldOwner).to.not.be.equal(newOwner);
      expect(newOwner).to.equal(addr2.address);
    });
    it("Should be able to approve months", async function() {
      await tTimeshareMonth.approve(addr2.address, monthTokenIds[6]);
      await addr2TimeshareMonth.transferFrom(
        addr1.address,
        addr2.address,
        monthTokenIds[6]
      );
      expect(await addr2TimeshareMonth.ownerOf(monthTokenIds[6]))
      .to.be.equal(addr2.address);
    });
    it("Should be able to increase time correctly", async function() {
      var startTime = await getLastBlockTime();
      await increaseTime(THIRTY_DAYS_IN_SECONDS);
      var finTime   = await getLastBlockTime();
      expect(finTime - startTime).to.be.closeTo(THIRTY_DAYS_IN_SECONDS, 5);

      // blockchain uses seconds but js Date uses millis
      var oldMonth = new Date(startTime*1000).getMonth();
      var newMonth = new Date(finTime*1000).getMonth();
      expect(newMonth - oldMonth).to.be.equal(1);
    });
    it("Should be able to set to any month", async function() {
      var november = Math.floor(new Date('2021-11-02') / 1000);
      var newTime = await setTime(november);

      expect(new Date(newTime*1000).getMonth()).to.equal(10) // 0-indexed
    });
    it("Should update owner correctly each month", async function() {
      var january  = Math.floor(new Date('2022-01-02')/ 1000);
      var february = Math.floor(new Date('2022-02-02')/ 1000);

      await setTime(january);

      await tTimeshareMonth.transferFrom(
        addr1.address,
        addr2.address,
        monthTokenIds[0]
      );
      await tTimeshareMonth.transferFrom(
        addr1.address,
        addr3.address,
        monthTokenIds[1]
      );

      var curOwner = await tTimeshare.ownerOf(timeshareTokenId);
      expect(curOwner).to.be.equal(addr2.address);

      await setTime(february);
      var newOwner = await tTimeshare.ownerOf(timeshareTokenId);
      expect(newOwner).to.be.equal(addr3.address);

    });
    it("Should wrap around December", async function() {
      var december = Math.floor(new Date('2022-12-10')/ 1000);
      var jan      = Math.floor(new Date('2023-01-05')/ 1000);

      await setTime(december);

      await tTimeshareMonth.transferFrom(
        addr1.address,
        addr2.address,
        monthTokenIds[11]
      );
      await tTimeshareMonth.transferFrom(
        addr1.address,
        addr3.address,
        monthTokenIds[0]
      );

      var curOwner = await tTimeshare.ownerOf(timeshareTokenId);
      expect(curOwner).to.be.equal(addr2.address);

      await setTime(jan);
      var newOwner = await tTimeshare.ownerOf(timeshareTokenId);
      expect(newOwner).to.be.equal(addr3.address);
    });
    it("Should get right month for monthTokenIds", async function() {
      for (let i = 0; i < monthTokenIds.length; i++) {
        var mo = await tTimeshareMonth.month(monthTokenIds[i]);
        expect(mo).to.equal(i);
      }
    });
  });




  describe("Redeeming Timeshares", function() {
    let timeshareTokenId;
    let monthTokenIds;
    let addr2TimeshareMonth;
    let addr2Timeshare;
    let addr2ExternalNFT;
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

      addr2TimeshareMonth = tTimeshareMonth.connect(addr2);
      addr2Timeshare      = tTimeshare.connect(addr2);
      addr2ExternalNFT    = tExternalNFT.connect(addr2);
    });

    it("Should restore ownership of the NFT", async function() {
      var externalNFTOwner = await tExternalNFT.ownerOf(externalTokenId);
      expect(externalNFTOwner).to.be.equal(tTimeshare.address);

      console.log("Timeshare contract addr", tTimeshare.address);
      console.log("Address 1, ", addr1.address)
      await tTimeshare.redeem(timeshareTokenId, addr1.address);
      externalNFTOwner = await tExternalNFT.ownerOf(externalTokenId);
      expect(externalNFTOwner).to.be.equal(addr1.address);
    });

    it("Can't be redeemed twice", async function() {
      await tTimeshare.redeem(timeshareTokenId, addr1.address);
      expect(tTimeshare.redeem(timeshareTokenId, addr1.address))
      .to.be.revertedWith("Redeem Timeshare: Nonexistent tokenId");
    });
    it("Can be redeemed with approval vs ownership", async function() {
      await tTimeshareMonth.transferFrom(
        addr1.address,
        addr2.address,
        monthTokenIds[0]
      );
      await addr2TimeshareMonth.approve(addr1.address, monthTokenIds[0]);

      await tTimeshare.redeem(timeshareTokenId, addr1.address);
      var externalNFTOwner = await tExternalNFT.ownerOf(externalTokenId);
      expect(externalNFTOwner).to.be.equal(addr1.address);
    });
    it("Can't be redeemed if you own SOME", async function() {
      await tTimeshareMonth.transferFrom(
        addr1.address,
        addr2.address,
        monthTokenIds[0]
      );
      expect(tTimeshare.redeem(timeshareTokenId, addr1.address))
      .to.be.revertedWith("Redeem: Sender can't operate all TimeshareMonths");
      var externalNFTOwner = await tExternalNFT.ownerOf(externalTokenId);
      expect(externalNFTOwner).to.be.equal(tTimeshare.address);
    });
    it("Can be sent to a different owner", async function() {
      await tTimeshare.redeem(timeshareTokenId, addr2.address);
      var externalNFTOwner = await tExternalNFT.ownerOf(externalTokenId);
      expect(externalNFTOwner).to.be.equal(addr2.address);
    });
    it("Can't be redeemed by non-participant", async function() {
      expect(addr2Timeshare.redeem(timeshareTokenId, addr1.address))
      .to.be.revertedWith("Redeem: Sender can't operate all TimeshareMonths");
    });

  });

});
