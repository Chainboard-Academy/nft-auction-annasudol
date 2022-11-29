// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IMyErc20 {
    function mint(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

}
interface IMyErc721 {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external returns (address);
}

contract NFTAuction is IERC721Receiver {
    IMyErc721 public myERC721;
    IMyErc20 public myERC20;
    address public contractOwner;

    struct NFTAsset {
        uint256 toknenID;
        uint256 minBid;
        uint256 highestBid;
        address highestBidder;
        uint256 startAt;
        uint256 endAt;
        address owner;
    }
    mapping(uint256=> NFTAsset) public NFTs;

    constructor(address _MyErc20) {
        contractOwner = msg.sender;
        myERC20 = IMyErc20(_MyErc20);
    }
    // event MintNFT(address to, uint256 tokenId);
    event ERC721Received(address operator, address from, uint tokenId, bytes data);
    event Bid(address bidder, uint256 tokenId, uint256 bid);
    event FinishAuction(address winner, uint256 tokenId, uint256 bid);
    event ReturnNFT(uint256 tokenId);

    modifier checkBalance(uint256 bid) {
        uint256 balance = myERC20.balanceOf(msg.sender);
        require(balance >= bid, 'not enough ERC20 funds');
        _;
    }
    /**
     * ERC721TokenReceiver interface function. Hook that will be triggered on safeTransferFrom as per EIP-721.
     * It should execute a deposit for `_from` address.
     * After deposit this token can be either returned back to the owner, or placed on auction.
     * It should emit an event that will let the user know that the deposit is successful.
     * It is mandatory to call ERC721 contract back to check if a token is received by auction (require ownerOf(nftId) to be equal address(this))
     */
    // function onERC721Received(address,
    //     address,
    //     uint256,
    //     bytes calldata) external pure returns (bytes4) {
    //     emit ERC721Received(from, _tokenId);
    //     return IERC721Receiver.onERC721Received.selector;
    // }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) public override returns (bytes4) {
        emit ERC721Received(operator, from, tokenId, data);
        return this.onERC721Received.selector;
    }
    /*
    list on auction NFT that msg.sender has deposited with safeTransferFrom. 
    Users willing to list their NFT are free to choose any ERC20 token for bids. 
    Also, they have to input the auction start UTC timestamp, auction end UTC timestamp and minimum bid amount. 
    During the auction there should be no way for NFT to leave the contract - it should be locked on contract. 
    One NFT can participate in only one auction.
    */
    function listNFTOnAuction(uint256 _tokenId, uint256 _minBid, uint256 numberOfDays, address MyErc721) checkBalance(_minBid) public {
        myERC721 = IMyErc721(MyErc721);
        address nftOwner = myERC721.ownerOf(_tokenId);
        require(nftOwner == msg.sender, "only owner");

        NFTs[_tokenId] = NFTAsset(_tokenId, _minBid, 0, address(0), block.timestamp, block.timestamp + (numberOfDays * 1 days), msg.sender);
        myERC20.transferFrom(msg.sender, address(this), _minBid);
        // _onERC721Received(nftOwner, _tokenId);
        myERC721.safeTransferFrom(nftOwner, address(this), _tokenId);
    }


    /*
    placeBid - should take from user ERC20 tokens specified in listOnAuction function for specific NFT (address+tokenId). 
    Function should revert if bid is placed out of auction effective time range specified in listNFTOnAuction. 
    Bid cannot be reverted, once tokens are deposited, they can be only returned when bidder loses.
    */
    function placeBid(uint256 _tokenId, uint256 bid) public {
        require(NFTs[_tokenId].endAt > block.timestamp, "auction ended");
        require(NFTs[_tokenId].minBid < bid, "min bid is higher");
        require(NFTs[_tokenId].highestBid < bid, "last bid is higher");

        //If there were previous bids
        if(NFTs[_tokenId].highestBidder != address(0)){
            //transfer money to the previous bidder
            myERC20.transferFrom(msg.sender, NFTs[_tokenId].highestBidder, bid);
        } else {
        //no b bids, transfer money to the NFT owner
            myERC20.transferFrom(msg.sender, NFTs[_tokenId].owner, bid);
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
            myERC721.safeTransferFrom(address(this), NFTs[_tokenId].highestBidder, _tokenId);
            delete NFTs[_tokenId];
         } else {
            //no bids, nft back to the owner
            emit ReturnNFT(_tokenId);
            _withdrawNft(_tokenId);
         }
    }


    function _withdrawNft(uint256 _tokenId) internal {
        //money and NFT is going back to the NFT creator
        myERC20.transfer(NFTs[_tokenId].owner, NFTs[_tokenId].minBid);
        myERC721.safeTransferFrom(address(this), NFTs[_tokenId].owner, _tokenId);
        delete NFTs[_tokenId];
    }
}