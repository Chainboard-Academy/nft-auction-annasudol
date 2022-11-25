// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyErc721 is ERC721 {
    constructor() ERC721("MyErc721", "ERC721") {}

    function mintNFT(address to, uint256 _tokenId) public {
        _safeMint(to, _tokenId);
    }

    function ownerOf(uint256 _tokenId) public override view returns (address) {
        return _ownerOf(_tokenId);
    }
}
