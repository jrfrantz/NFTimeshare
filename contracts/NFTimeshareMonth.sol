// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./NFTimeshare.sol";

contract NFTimeshareMonth is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    NFTimeshare private _NFTimeshare;
    mapping (uint256 => uint256) private _timeshareForMonth;
    mapping (uint256 => uint256[12]) private _monthsForTimeshare;

    constructor() ERC721("TimeshareMonth","TIME") {}

    // return the int representation of the month of this token, 0-indexed
    // 0 = January; 11 = December
    function month(uint256 tokenId) public view returns (uint8) {
        require(_exists(tokenId), "month query for nonexistent token");
        uint256 timeshareTokenId = _timeshareForMonth[tokenId];
        require(timeshareTokenId != 0, "Token doesn't exist");
        uint256[12] memory allMonths = _monthsForTimeshare[timeshareTokenId];

        for (uint8 i = 0; i < 12; i++) {
            if (tokenId == allMonths[i]) {
                return i;
            }
            assert(allMonths[i] > 0); // shouldn't be any empties
        }
        assert(false); // couldn't find month for tokenId
    }

    function _baseURI() internal view virtual override returns (string memory) {
      return "www.nftimeshares.fun/timesharemonth/";
    }
    function underlyingTokenURI(uint256 tokenId) public view virtual returns (string memory) {
      require(address(_NFTimeshare) != address(0x0), "TimeshareMonth tokenURI: Timeshare contract hasn't been set");
      require (_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

      uint256 timeshareTokenId = _timeshareForMonth[tokenId];
      assert(timeshareTokenId > 0); // if token _exists() we should have a mapping for it.
      return _NFTimeshare.underlyingTokenURI(timeshareTokenId);
    }
    // assumes the NFT is already wrapped by the NFTimeshare contract
    function makeTimesharesFor(uint256 timeshareTokenId, address to) external onlyTimeshare {
        // require msg.sender owns the times
        require(msg.sender == address(_NFTimeshare), "Only the parent NFTimeshare contract can mint TimeshareMonths");

        uint256[12] memory newMonthTokenIds;
        for (uint8 i = 0; i < 12; i++) {
            _tokenIds.increment();
            newMonthTokenIds[i] = _tokenIds.current();
            _timeshareForMonth[newMonthTokenIds[i]] = timeshareTokenId;
        }
        _monthsForTimeshare[timeshareTokenId] = newMonthTokenIds;

        // mint all
        for (uint8 i = 0; i < 12; i++) {
            _safeMint(to, newMonthTokenIds[i]);
        }
    }

    function burnTimeshareMonthsFor(address spender, uint256 timeshareTokenId) external onlyTimeshare {
        uint256[12] memory months = _monthsForTimeshare[timeshareTokenId];
        require(months[0] != 0, "No TimeshareMonths to burn for tokenId");
        require(isApprovedForAllMonths(spender, timeshareTokenId), "Redeem: Sender can't operate all TimeshareMonths");

        delete _monthsForTimeshare[timeshareTokenId];
        for (uint8 i = 0; i < 12; i++) {
            delete _timeshareForMonth[months[i]];
        }

        for (uint8 i = 0; i < 12; i++) {
            _burn(months[i]);
        }
    }

    function getTimeshareMonths(uint256 timeshareTokenId) public view virtual returns (uint256[12] memory) {
        return _monthsForTimeshare[timeshareTokenId];
    }

    // get the tokenId of the parent NFTimeshare for this NFTimeshareMonth
    function getParentTimeshare(uint256 timeshareMonthTokenId) public view virtual returns (uint256) {
      return _timeshareForMonth[timeshareMonthTokenId];
    }

    function setNFTimeshareAddress(address addr) public onlyOwner {
        _NFTimeshare = NFTimeshare(addr);
    }

    function getNFTimeshareAddress() public view virtual returns (address) {
      return address(_NFTimeshare);
    }


    function isApprovedForAllMonths(address spender, uint256 timeshareTokenId) public view virtual returns (bool) {
        uint256[12] memory months = _monthsForTimeshare[timeshareTokenId];
        for (uint8 i = 0; i < 12; i++) {
            if (!_isApprovedOrOwner(spender, months[i])) {
                return false;
            }
        }
        return true;
    }

    modifier onlyTimeshare {
        require(address(_NFTimeshare) != address(0x0), "NFTimeshare contract address has not been set");
        require(msg.sender == address(_NFTimeshare), "Function can only be called by parent Timeshare");
        _;
    }
}
