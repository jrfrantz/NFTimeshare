pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "hardhat/console.sol";



contract TestNFT is Initializable, ERC721EnumerableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;

    function initialize() public initializer {
      // call parent initializer
      __ERC721_init("TestNFT", "tnft");
      __ERC721Enumerable_init();
    }

    // function that mints a new TestNFT and gives it to msg.sender
    function awardTestNFT() public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        return newItemId;
    }

    function tokenURI(uint256 tokenId) public virtual override view returns (string memory) {
        return string(abi.encodePacked("http://my-json-server.typicode.com/abcoathup/samplenft/tokens/", StringsUpgradeable.toString(tokenId)));
    }
}
