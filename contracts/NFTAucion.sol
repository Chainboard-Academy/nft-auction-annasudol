// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./MyERC721.sol";

interface IMyErc20 {
    function mint(address to, uint256 amount) external;
}
interface IMyERC721 {
    function safeMint(address to, uint256 tokenId, string memory tokenURI) external;
    function isOwner(uint256 tokenId) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

contract NFTAucion is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private tokenId;
    IMyErc20 public myERC20;
    IMyERC721 public myERC721;
    address public contractOwner;

    struct NFTAsset {
        uint tokenId;
        string tokenURI;
        uint256 minBid;
        uint256 highestBid;
        bool isListed;
        address highestBidder;
        address owner;
        uint256 startAt;
        uint256 endAt;
    }
    mapping(uint=> NFTAsset) private NFTs;

    constructor(address _IMyErc20, address _IMyERC721) {
        contractOwner = msg.sender;
        myERC20 = IMyErc20(_IMyErc20);
        myERC721 = IMyERC721(_IMyERC721);
    }

    event TransferReceivedNFT(address from, uint tokenId);
    event Bid(address bidder, uint tokenId, uint256 bid);

    function mintNFT(string memory tokenURI) public returns (uint) {
        tokenId.increment();
        uint newTokenId = tokenId.current();
        NFTs[newTokenId] = NFTAsset(newTokenId, tokenURI, 0, 0, false, address(0), msg.sender, 0, 0);
        myERC721.safeMint(msg.sender, newTokenId, tokenURI);
        return newTokenId;
    }
    function listNFTOnAuction(uint _tokenId, uint256 _minBid, uint256 numberOfDays) public {
        require(myERC721.isOwner(_tokenId), 'you are not the NFT owner');
        NFTs[_tokenId].minBid = _minBid;
        NFTs[_tokenId].isListed = true;
        NFTs[_tokenId].startAt = block.timestamp;
        NFTs[_tokenId].endAt = block.timestamp + (numberOfDays * 1 days);
        myERC721.safeTransferFrom(msg.sender, address(this), _tokenId);
        emit TransferReceivedNFT(msg.sender, _tokenId);
    }

    function placeBid(uint _tokenId, uint256 bid) public {
        require(NFTs[_tokenId].isListed, "NFT not listed");
        require(NFTs[_tokenId].endAt >= block.timestamp, "auction ended");
        require(NFTs[_tokenId].minBid < bid, "min bid is higher");
        require(NFTs[_tokenId].highestBid < bid, "last bid is higher");

        NFTs[_tokenId].highestBid = bid;
        NFTs[_tokenId].highestBidder = msg.sender;
        emit Bid(msg.sender, _tokenId, bid);
    }
}