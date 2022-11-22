// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyErc721 is ERC721URIStorage {
    mapping(string => bool) private usedTokenURIs;
    constructor() ERC721("MyErc721", "ERC721") {}

    function safeMint(address to, uint256 tokenId, string memory tokenURI) public {
        require(usedTokenURIs[tokenURI] == false, "Token URI already exists");
        _safeMint(to, tokenId);
         usedTokenURIs[tokenURI] = true;
        _setTokenURI(tokenId, tokenURI);
    }

    function ownerOf(uint256 tokenId) public override view  returns (address) {
        return _ownerOf(tokenId);
    }
}
