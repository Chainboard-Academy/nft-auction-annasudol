import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTAuction", function () {
    async function deployedNFTAuction() {
        const ONE_DAY_IN_SECS = 24 * 60 * 60;
        const TEN_DAYS_IN_SECS = 10 * 24 * 60 * 60;
        const zeroValue = ethers.constants.Zero;

        const [acc0, acc1, acc2, acc3] = await ethers.getSigners();

        const MyErc20 = await ethers.getContractFactory("MyErc20");
        const erc20 = await MyErc20.deploy();

        const MyErc721 = await ethers.getContractFactory("MyErc721");
        const erc721 = await MyErc721.deploy();

        const NFTAuction = await ethers.getContractFactory("NFTAuction");
        const auction = await NFTAuction.deploy(erc20.address, erc721.address);

        return { auction, erc20, erc721, acc0, acc1, acc2, acc3, ONE_DAY_IN_SECS, zeroValue };
    }

    describe('Mint NFT', async () => {
        const { auction, erc721, acc0, zeroValue } = await loadFixture(deployedNFTAuction);
        const token_url_1 = 'url';
        const nftId = 1;

        before(async function () {
            await auction.mintNFT(token_url_1);
        });
        it("display nft's value properly", async function () {
            const { tokenURI, isListed, minBid, highestBid, highestBidder, startAt, endAt } = await auction.NFTs(nftId);
            expect(tokenURI).equal(token_url_1);
            expect(isListed).equal(false);
            expect(minBid).equal(zeroValue);
            expect(highestBidder).equal(ethers.constants.AddressZero);
            expect(highestBid).equal(zeroValue);
            expect(startAt).equal(zeroValue);
            expect(endAt).equal(zeroValue);
        });
        it("display nft's owner properly", async function () {
            const nftOwner = await erc721.ownerOf(nftId);
            expect(nftOwner).to.equal(acc0.address);
        });
    })

    // describe('list NFT on auction', async () => {
    //     const { auction, erc721, zeroValue } = await loadFixture(deployedNFTAuction);
    //     const token_url_1 = 'url';
    //     const nftId = 1;
    //     const mintBidEth = ethers.utils.formatEther('0.005');
    //     before(async function () {
    //         await auction.mintNFT(token_url_1);
    //         await auction.listNFTOnAuction(nftId, mintBidEth, 1);
    //     });
    //     it("display nft's value properly", async function () {
    //         const { isListed, minBid, startAt, endAt, ONE_DAY_IN_SECS } = await auction.NFTs(nftId);
    //         const timestamp = (await auction.getBlock(0)).timestamp;
    //         expect(isListed).equal(true);
    //         expect(minBid).equal(mintBidEth);
    //         expect(startAt).equal(timestamp);
    //         expect(endAt).equal((timestamp + ONE_DAY_IN_SECS));
    //     });
    //     it("display nft's owner properly", async function () {
    //         const nftOwner = await erc721.ownerOf(nftId);
    //         expect(nftOwner).to.equal(zeroValue);
    //     });
    // })
});
