import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

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
    const nftId_1 = 1;
    const nftId_2 = 2;
    const nftId_3 = 3;

    before(async () => {
        [acc0, acc1] = await ethers.getSigners();
        const MyErc20 = await ethers.getContractFactory("MyErc20");
        erc20 = await MyErc20.deploy();
        const MyErc721 = await ethers.getContractFactory("MyErc721");
        erc721 = await MyErc721.deploy();

        const NFTAuction = await ethers.getContractFactory("NFTAuction");
        auction = await NFTAuction.deploy(erc20.address, erc721.address);
    })

    describe('mint nft', () => {
        it('emit event', async () => {
            const tx = await auction.mintNFT(nftId_1);
            await expect(tx).to.emit(auction, "MintNFT").withArgs(acc0.address, nftId_1);
        });
        it('displays minted value on the state', async () => {
            const { isListed, owner } = await auction.NFTs(nftId_1);
            expect(isListed).to.be.false;
            expect(owner).to.be.equal(acc0.address)
        });
    });
    describe('listNFTOnAuction', () => {
        const min_bid = 2;
        before(async function () {
            await auction.mintNFT(nftId_2);
            await auction.connect(acc1).mintNFT(nftId_3)
        });
        it('emits ERC721Received ang change the owner to contract address', async () => {
            let nftOwner = await erc721.ownerOf(nftId_2);
            expect(nftOwner).to.equal(acc0.address)
            await erc721.approve(auction.address, nftId_2)
            const tx = await auction.listNFTOnAuction(nftId_2, min_bid, 1);
            nftOwner = await erc721.ownerOf(nftId_2);
            expect(nftOwner).to.equal(auction.address)

            // await expect(tx).to.emit(auction, "ERC721Received").withArgs(auction.address, nftId_2);
        });
        it('reverts transaction', async () => {
            await erc721.connect(acc1).approve(auction.address, nftId_3)
            await expect(auction.listNFTOnAuction(nftId_3, min_bid, 1)).to.be.rejectedWith("you are not the NFT owner")
        })
    });

    describe('place Bid', () => {
        const bid = 5;
        const nftId_4 = 4;
        before(async function () {
            await auction.mintNFT(nftId_4);
            await erc721.approve(auction.address, nftId_4);
        });
        it('reverts transaction', async () => {
            await expect(auction.placeBid(nftId_3, 5)).to.be.rejectedWith("NFT not listed")
            await auction.listNFTOnAuction(nftId_4, 1, 1);
            await expect(auction.placeBid(nftId_4, 1)).to.be.rejectedWith("min bid is higher")
        });
        it('changes state after accepting transaction', async () => {
            await erc20.mint(auction.address, bid);
            const tx_allowance = await erc20.increaseAllowance(auction.address, bid);
            tx_allowance.wait();
            const tx = await auction.placeBid(nftId_4, bid);

            // // // await expect(tx).to.emit(auction, "Bid").withArgs(acc0.address, nftId_2, 5);
            const { highestBidder, highestBid } = await auction.NFTs(nftId_4);
            expect(highestBidder).to.equal(acc0.address);
            expect(highestBid).to.be.equal(bid);
        })
    });


    // describe('finish auction', () => {

    //     before(async function () {
    //         // await time.increaseTo(endAt);

    //     });
    //     it('reverts transaction', async () => {
    //         await expect(auction.finishAuction(nftId_3)).to.be.rejectedWith("auction not ended")
    //         // await auction.listNFTOnAuction(nftId_3, 1, 1);
    //         // await expect(auction.placeBid(nftId_3, 1)).to.be.rejectedWith("min bid is higher")
    //     });
    //     it('reverts transaction', async () => {
    //         await expect(auction.finishAuction(nftId_3)).to.be.rejectedWith("auction not ended")
    //         // await auction.listNFTOnAuction(nftId_3, 1, 1);
    //         // await expect(auction.placeBid(nftId_3, 1)).to.be.rejectedWith("min bid is higher")
    //     });

    // });

    // const nftId = 1;
    // const mintBid = 1;

    // it("emits ERC721Received after listNFTOnAuction and changes owner", async function () {
    // let nftOwner = await erc721.ownerOf(nftId);
    // expect(nftOwner).to.equal(acc0.address)
    // const tx = await auction.listNFTOnAuction(nftId, nftId, 1);
    // await expect(tx).to.emit(auction, "ERC721Received").withArgs(acc0.address, nftId);
    // nftOwner = await erc721.ownerOf(nftId);
    // expect(nftOwner).to.equal(auction.address);
    // });

    // describe('placeBid', () => {
    //     const nftId_2 = 2;
    //     const bid = 3;
    //     before(async function () {
    //         await erc721.mintNFT(nftId_2);
    //         await erc721.approve(auction.address, nftId_2);
    //         await erc20.mint(acc0.address, bid);
    //         await erc20.mint(acc1.address, bid);
    //         await erc20.increaseAllowance(auction.address, bid);
    //     });
    //     it('reverts transaction', async () => {

    //         await expect(auction.placeBid(nftId, 1)).to.be.rejectedWith("min bid is higher")

    //         // require(!NFTs[_tokenId].isListed, "NFT not listed");
    //         // require(NFTs[_tokenId].endAt >= block.timestamp, "auction ended");
    //         // require(NFTs[_tokenId].minBid < bid, "min bid is higher");
    //         // require(NFTs[_tokenId].highestBid < bid, "last bid is higher");

    //     })
    //     it('bid transaction', async () => {

    //         const tx = await auction.placeBid(nftId, 2);

    //         // require(!NFTs[_tokenId].isListed, "NFT not listed");
    //         // require(NFTs[_tokenId].endAt >= block.timestamp, "auction ended");
    //         // require(NFTs[_tokenId].minBid < bid, "min bid is higher");
    //         // require(NFTs[_tokenId].highestBid < bid, "last bid is higher");

    //     })
    // });

});
