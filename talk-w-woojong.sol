/*Decisions:
- fixed price auction
- choose which charitygroup you buy from (4 total)
- 1968*4 total batons
- not going to see metadata when minting, but will be revealed later
- minimize gas costs
- minimize potential for confusion
*/

// tokenId (order minted) ≠ batonId (after shuffle - an asset)
// assumption: we can ask Glenn's team to order the assets
// however we want
/**
  "Stored data" method
  Easier to reason about & more flexible,
  but takes more storage (1968*4 structs)
*/
  BatonInfo[1968*4] batonInfo;
  BatonInfo {
    uint256 charityGroupIndex;
    uint8   evolutionState;
    uint256
  }
  mint(uin256 charityId) {
    uint256 tokenId = totalSupply();
    batonInfo.push(BatonInfo({charityId, 0, }))
    mint(tokenId, msg.sender);
  }
  function batonId(uint256 tokenId) {
    return batonInfo[tokenId].batonId;
  }
  function revealMetadata(string ipfs_base) {
    uint256 offset = chainlinkVRF() % (1968 * 4);
  }

/**
  "Arithmetic" method
  Obtuse but doesn't need as much storage
*/
address[4] paymentSplitters;
function mint(uint256 charityId) {
    require( 0 <= charityId < 4);
}
function revealMetadata(string ipfs_base) {
    uint256 offset = chainlinkVRF() % 1968;
}
function batonId(uint256 tokenId) {
    uint256 charityGroup = tokenId / 1968;
    uint256 groupOffset = (tokenId + offset) % 1968
    uint256 batonId = charityGroup * 1968 + groupOffset;
}
function donate(uint256 tokenId) {
}
function tokenURI(uint256 tokenId) {
  return ipfs_base + batonId(tokenId).toString()
}
