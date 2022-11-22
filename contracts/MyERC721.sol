// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyERC721 is ERC721URIStorage {
    mapping(string => bool) private usedTokenURIs;

    constructor() ERC721("MyERC721", "ERC721") {}

    function safeMint(address to, uint256 tokenId, string memory tokenURI) public {
        require(_tokenURIExists(tokenURI), "Token URI already exists");
        _safeMint(to, tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI) public {
        return _setTokenURI(tokenId, tokenURI);
    }

    function _tokenURIExists(string memory tokenURI) internal view returns (bool) {
        return usedTokenURIs[tokenURI] == true;
    }
}
