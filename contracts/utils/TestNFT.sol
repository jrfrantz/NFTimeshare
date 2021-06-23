pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TestNFT is ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("TestNFT","tnft") {}

    // function that mints a new TestNFT and gives it to msg.sender
    function awardTestNFT() public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);

        return newItemId;
    }

    function tokenURI(uint256 tokenId) public virtual override view returns (string memory) {
        return Strings.toString(tokenId);
    }
}
