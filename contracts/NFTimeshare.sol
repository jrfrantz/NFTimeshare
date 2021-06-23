// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFTimeshareMonth.sol";
import "./utils/BokkyPooBahsDateTimeLibrary.sol";

// TODO: shouldn't really be an ERC721... it implements metadata (and maybe enumerable) but it's not really a token since it's synthetic. it could have its own interface?
contract NFTimeshare is ERC721Enumerable, ERC721Holder, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    NFTimeshareMonth private _NFTimeshareMonths;

    mapping (address => mapping (uint256 => uint256)) private _tokenIdForUnderlying;
    mapping (uint256 => UnderlyingNFT)                private _wrappedNFTs;

    struct UnderlyingNFT {
        address _contractAddr;
        uint256 _tokenId;
    }


    constructor() ERC721("Timeshare", "TSBO") {}

    // given an an NFT (contract + tokenId), wrap it and mint it into timeshares.
    // this contract must be approved to operate it. _to must be able to receive erc721s.
    function deposit(address _underlying, uint256 _underlyingTokenId, address _from, address _to) public virtual needsTimeshareMonths {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _tokenIdForUnderlying[_underlying][_underlyingTokenId] = newTokenId;
        _wrappedNFTs[newTokenId] = UnderlyingNFT(_underlying, _underlyingTokenId);

        _NFTimeshareMonths.makeTimesharesFor(newTokenId, _to);
        IERC721(_underlying).safeTransferFrom(_from, address(this), _underlyingTokenId);
    }

    // redeem a wrapped NFT if you own all the timeshares.
    // approves sender to withdraw NFT but owner still needs to initiate transfer
    // TODO split redeem into redeem + withdraw to match a pull-payment style.
    function redeem(uint256 tokenId, address _to) public virtual needsTimeshareMonths {
        UnderlyingNFT memory underlyingNFT = _wrappedNFTs[tokenId];
        require(underlyingNFT._contractAddr != address(0) && underlyingNFT._tokenId != 0, "Redeem Timeshare: Nonexistent tokenId");
        require(_NFTimeshareMonths.isApprovedForAllMonths(msg.sender, tokenId), "Redeem: Sender can't operate all TimeshareMonths");

        delete _tokenIdForUnderlying[underlyingNFT._contractAddr][underlyingNFT._tokenId];
        delete _wrappedNFTs[tokenId];

        _NFTimeshareMonths.burnTimesharesFor(tokenId);
        IERC721(underlyingNFT._contractAddr).safeTransferFrom(address(this), _to, underlyingNFT._tokenId);

    }

    function setNFTimeshareMonthAddress(address _addr) public onlyOwner {
        _NFTimeshareMonths = NFTimeshareMonth(_addr);
    }

    function getNFTimeshareMonthAddress() public view returns (address) {
      return address(_NFTimeshareMonths);
    }

    function getWrappedNFT(uint256 tokenId) public view returns (address, uint256) {
        // make sure tokenId exists...
        UnderlyingNFT memory underlying = _wrappedNFTs[tokenId];
        return (underlying._contractAddr, underlying._tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override needsTimeshareMonths returns (string memory) {
        UnderlyingNFT memory underlying = _wrappedNFTs[tokenId];
        string memory retval = IERC721Metadata(underlying._contractAddr).tokenURI(underlying._tokenId);
        return retval;
    }
    modifier needsTimeshareMonths {
        require(address(_NFTimeshareMonths) != address(0x0), "NFTimeshare contract address hasn't been set up");
        _;
    }

    function balanceOf(address owner) public view virtual override needsTimeshareMonths returns (uint256){
        uint256 numTSMonthsOwned = _NFTimeshareMonths.balanceOf(owner);
        uint256 curMonth = BokkyPooBahsDateTimeLibrary.getMonth(block.timestamp) - 1; // bokky is 1-indexed
        uint256 activeTimeshares = 0;
        for (uint256 i = 0; i < numTSMonthsOwned; i++) {
            uint256 monthTokenId  = _NFTimeshareMonths.tokenOfOwnerByIndex(owner, i);
            uint256 monthForToken = _NFTimeshareMonths.month(monthTokenId); // 0-indexed
            if (monthForToken == curMonth) {
                activeTimeshares++;
            }
        }
        return activeTimeshares;
    }

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        // -- override so that it only shows WHOEVER HOLDS THE CURRENT MONTH
        uint256 curMonth = BokkyPooBahsDateTimeLibrary.getMonth(block.timestamp); // 1-indexed
        uint256[12] memory timeshareMonths = _NFTimeshareMonths.getTimeshareMonths(tokenId); // 0-indexed
        return _NFTimeshareMonths.ownerOf(timeshareMonths[curMonth-1]);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        // override block
        return;
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        // override block
        return;
    }

    function approve(address to, uint256 tokenId) public virtual override {
        // block
        return;
    }

    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        return address(0);
    }
    function setApprovalForAll(address operator, bool _approved) public virtual override {
        return;
    }
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return false;
    }
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
        return;
    }
}
