import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NFTAuction", function () {
    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    const TEN_DAYS_IN_SECS = 10 * 24 * 60 * 60;
    const zeroValue = ethers.constants.Zero;
    const zeroAddress = ethers.constants.AddressZero;
    let erc20: any;
    let erc721: any;
    let auction: any;
    let acc0: SignerWithAddress;
    let acc1: SignerWithAddress;

    before(async () => {
        [acc0, acc1] = await ethers.getSigners();
        const MyErc20 = await ethers.getContractFactory("MyErc20");
        erc20 = await MyErc20.deploy();

        const MyErc721 = await ethers.getContractFactory("MyErc721");
        erc721 = await MyErc721.deploy();

        const NFTAuction = await ethers.getContractFactory("NFTAuction");
        auction = await NFTAuction.deploy(erc20.address, erc721.address);
    })


    const nftId = 1;
    const mintBid = 1;
    before(async function () {
        await erc721.mintNFT(nftId);
        await erc721.approve(auction.address, mintBid);
    });
    it("emits ERC721Received after listNFTOnAuction and changes owner", async function () {
        let nftOwner = await erc721.ownerOf(nftId);
        expect(nftOwner).to.equal(acc0.address)
        const tx = await auction.listNFTOnAuction(nftId, nftId, 1);
        await expect(tx).to.emit(auction, "ERC721Received").withArgs(acc0.address, nftId);
        nftOwner = await erc721.ownerOf(nftId);
        expect(nftOwner).to.equal(auction.address);
    });

    describe('placeBid', () => {
        const nftId_2 = 2;
        const bid = 3;
        before(async function () {
            await erc721.mintNFT(nftId_2);
            await erc721.approve(auction.address, nftId_2);
            await erc20.mint(acc0.address, bid);
            await erc20.mint(acc1.address, bid);
            await erc20.increaseAllowance(auction.address, bid);
        });
        it('reverts transaction', async () => {

            await expect(auction.placeBid(nftId, 1)).to.be.rejectedWith("min bid is higher")

            // require(!NFTs[_tokenId].isListed, "NFT not listed");
            // require(NFTs[_tokenId].endAt >= block.timestamp, "auction ended");
            // require(NFTs[_tokenId].minBid < bid, "min bid is higher");
            // require(NFTs[_tokenId].highestBid < bid, "last bid is higher");

        })
        it('bid transaction', async () => {

            const tx = await auction.placeBid(nftId, 2);

            // require(!NFTs[_tokenId].isListed, "NFT not listed");
            // require(NFTs[_tokenId].endAt >= block.timestamp, "auction ended");
            // require(NFTs[_tokenId].minBid < bid, "min bid is higher");
            // require(NFTs[_tokenId].highestBid < bid, "last bid is higher");

        })
    });



    // it("display nft's owner properly", async function () {
    //     const nftOwner = await erc721.ownerOf(nftId);
    //     expect(nftOwner).to.equal(zeroValue);
    // });
});
