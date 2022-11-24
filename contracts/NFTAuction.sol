// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IMyErc20 {
    function mint(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
}
interface IMyErc721 {
    function mintNFT(uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external returns (address);
}

contract NFTAuction is AccessControl {

    IMyErc20 public myERC20;
    IMyErc721 public myERC721;
    address public contractOwner;

    struct NFTAsset {
        uint256 toknenID;
        uint256 minBid;
        uint256 highestBid;
        bool isListed;
        address highestBidder;
        uint256 startAt;
        uint256 endAt;
        address owner;
    }
    mapping(uint256=> NFTAsset) public NFTs;

    constructor(address _MyErc20, address _IMyErc721) {
        contractOwner = msg.sender;
        myERC20 = IMyErc20(_MyErc20);
        myERC721 = IMyErc721(_IMyErc721);
    }
    event MintNFT(address to, uint256 tokenId);
    event ERC721Received(address from, uint tokenId);
    event Bid(address bidder, uint256 tokenId, uint256 bid);
    event FinishAuction(address winner, uint256 tokenId, uint256 bid);
    event ReturnNFT(uint256 tokenId);
    modifier onlyNFTOwner (uint256 _tokenId) {
        require(NFTs[_tokenId].owner == msg.sender, 'you are not the NFT owner');
        _;
    }

    /**
     * ERC721TokenReceiver interface function. Hook that will be triggered on safeTransferFrom as per EIP-721.
     * It should execute a deposit for `_from` address.
     * After deposit this token can be either returned back to the owner, or placed on auction.
     * It should emit an event that will let the user know that the deposit is successful.
     * It is mandatory to call ERC721 contract back to check if a token is received by auction (require ownerOf(nftId) to be equal address(this))
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function mintNFT(uint256 _tokenId) public {
        NFTs[_tokenId] = NFTAsset(_tokenId, 0, 0, false, address(0), 0, 0, msg.sender);
        myERC721.mintNFT(_tokenId);
        emit MintNFT(msg.sender, _tokenId);
    }
    /*

    /*
    list on auction NFT that msg.sender has deposited with safeTransferFrom. 
    Users willing to list their NFT are free to choose any ERC20 token for bids. 
    Also, they have to input the auction start UTC timestamp, auction end UTC timestamp and minimum bid amount. 
    During the auction there should be no way for NFT to leave the contract - it should be locked on contract. 
    One NFT can participate in only one auction.
    */
    function listNFTOnAuction(uint256 _tokenId, uint256 _minBid, uint256 numberOfDays) onlyNFTOwner(_tokenId) public {
        uint256 _endAt = block.timestamp + (numberOfDays * 1 days);
        NFTs[_tokenId].minBid = _minBid;
        NFTs[_tokenId].endAt = _endAt;
        NFTs[_tokenId].endAt = _endAt;
        NFTs[_tokenId].isListed = true;
        NFTs[_tokenId].startAt = block.timestamp;
        NFTs[_tokenId].endAt = _endAt;
        address nftOwner = myERC721.ownerOf(_tokenId);
        myERC721.safeTransferFrom(nftOwner, address(this), _tokenId);
        emit ERC721Received(nftOwner, _tokenId);
    }
    /*
    placeBid - should take from user ERC20 tokens specified in listOnAuction function for specific NFT (address+tokenId). 
    Function should revert if bid is placed out of auction effective time range specified in listNFTOnAuction. 
    Bid cannot be reverted, once tokens are deposited, they can be only returned when bidder loses.
    */
    function placeBid(uint256 _tokenId, uint256 bid) public {
        require(NFTs[_tokenId].isListed, "NFT not listed");
        require(NFTs[_tokenId].endAt >= block.timestamp, "auction ended");
        require(NFTs[_tokenId].minBid < bid, "min bid is higher");
        require(NFTs[_tokenId].highestBid < bid, "last bid is higher");

        //If there were previous bids
        if(NFTs[_tokenId].highestBidder != address(0)){
            //transfer money to the previous bidder
            myERC20.transfer(NFTs[_tokenId].highestBidder, bid);
        } else {
             //transfer money to the NFT owner
            myERC20.transfer(myERC721.ownerOf(_tokenId), bid);
        }

        NFTs[_tokenId].highestBidder = msg.sender;
        NFTs[_tokenId].highestBid = bid;
        emit Bid(msg.sender, _tokenId, bid);
    }

    /**
     * can be called by anyone on blockchain after auction end UTC timestamp is reached.
     * Function should summarize auction results, transfer winning amount of ERC20 tokens to the auction issuer and unlock NFT for withdrawal
     * or placing on auction again only for the auction winner.
     * Note, that if the auction is finished without any single bid,
     * it should not make any ERC20 token transfer and let the auction issuer withdraw the token or start auction again.
     */
    function finishAuction(uint256 _tokenId) public {
         require(NFTs[_tokenId].endAt < block.timestamp, "auction not ended");
         if(NFTs[_tokenId].highestBid > 0) {
            emit FinishAuction(NFTs[_tokenId].highestBidder, _tokenId, NFTs[_tokenId].highestBid);
            _endAuction(_tokenId);
            _transferNFT(_tokenId);
         } else {
            //no bids, nft back to the owner
            emit ReturnNFT(_tokenId);
            _withdrawNft(_tokenId);
         }
    }

    function _transferNFT(uint256 _tokenId) internal {
        // require(NFTs[_tokenId].isListed == false, "NFT is listed");
        // require(NFTs[_tokenId].highestBidder == msg.sender, "you are not winner");
        //transfer NFT to winner
        myERC721.safeTransferFrom(address(this), msg.sender, _tokenId);
        emit ERC721Received(address(this), _tokenId);
        NFTs[_tokenId].highestBidder = address(0);
    }

    function _withdrawNft(uint256 _tokenId) internal {
        _endAuction(_tokenId);
         //nft transfer to the minter
        myERC721.safeTransferFrom(address(this), myERC721.ownerOf(_tokenId), _tokenId);
        emit ERC721Received(address(this), _tokenId);
    }

    function _endAuction(uint256 _tokenId) internal {
        NFTs[_tokenId].minBid = 0;
        NFTs[_tokenId].isListed = false;
        NFTs[_tokenId].startAt = 0;
        NFTs[_tokenId].endAt = 0;
    }
}