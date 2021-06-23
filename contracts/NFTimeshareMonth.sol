// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
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

    // just pass the URI for the wrapped asset
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(address(_NFTimeshare) != address(0x0), "TimeshareMonth tokenURI: Timeshare contract hasn't been set");
        require (_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        uint256 timeshareTokenId = _timeshareForMonth[tokenId];
        assert(timeshareTokenId > 0); // if token _exists() we should have a mapping for it.
        return _NFTimeshare.tokenURI(timeshareTokenId);
    }

    // assumes the NFT is already wrapped by the NFTimeshare contract
    function makeTimesharesFor(uint256 timeshareTokenId, address to) external onlyTimeshare {
        // require msg.sender owns the times
        require(msg.sender == address(_NFTimeshare), "Only the parent NFTimeshare contract can mint TimeshareMonths");
        require(msg.sender == _NFTimeshare.getApproved(timeshareTokenId), "Tx sender isn't approved to remove these timeshares");

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

    function burnTimesharesFor(uint256 timeshareTokenId) external onlyTimeshare {
        // TODO require this month to be valid
        uint256[12] memory months = _monthsForTimeshare[timeshareTokenId];
        require(months[0] != 0, "No TimeshareMonths to burn for tokenId");

        //TODO require msg.sender to be approved for EACH MONTH in months

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

    // TODO: make this only accessible by the deployer
    function setNFTimeshareAddress(address addr) public onlyOwner {
        _NFTimeshare = NFTimeshare(addr);
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
