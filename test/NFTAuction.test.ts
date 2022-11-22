import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTAuction", function () {
    async function deployedNFTAuction() {
        const ONE_DAY_IN_SECS = 24 * 60 * 60;
        const TEN_DAYS_IN_SECS = 10 * 24 * 60 * 60;
        // const startAt = (await time.latest()) + ONE_DAY_IN_SECS;
        // const endAt = (await time.latest()) + TEN_DAYS_IN_SECS;

        const [acc0, acc1, acc2, acc3] = await ethers.getSigners();

        const MyErc20 = await ethers.getContractFactory("MyErc20");
        const erc20 = await MyErc20.deploy();

        const MyErc721 = await ethers.getContractFactory("MyErc721");
        const erc721 = await MyErc721.deploy();

        const NFTAuction = await ethers.getContractFactory("NFTAuction");
        const auction = await NFTAuction.deploy(erc20.address, erc721.address);

        return { auction, erc20, erc721, acc0, acc1, acc2, acc3 };
    }

    describe('Mint NFT', () => {
        // let nftAuction: any;
        // before(async function () {
        //     const { auction } = await loadFixture(deployedNFTAuction);
        //     const token_url_1 = 'https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/540181272427156973313601247127328523667879114470100671728055534125280395265';
        //     nftAuction = await auction.mintNFT(token_url_1);
        // });
        it("display nft's value properly", async function () {
            const { auction, erc721, acc0 } = await loadFixture(deployedNFTAuction);
            const token_url_1 = 'url';
            const nftId = 1;
            await auction.mintNFT(token_url_1);
            const zeroValue = ethers.constants.Zero;
            const { tokenURI, isListed, minBid, highestBid, highestBidder, startAt, endAt } = await auction.NFTs(nftId);
            expect(tokenURI).equal(token_url_1);
            expect(isListed).equal(false);
            expect(minBid).equal(zeroValue);
            expect(highestBidder).equal(ethers.constants.AddressZero);
            expect(highestBid).equal(zeroValue);
            expect(startAt).equal(zeroValue);
            expect(endAt).equal(zeroValue);

            const nftOwner = await erc721.ownerOf(nftId);
            expect(nftOwner).to.equal(acc0.address);
        });
    })

    //   describe("list asset", function () {
    //     it("Should bid and win auction correctly", async function () {
    //       const { token, auction, nft, owner, acc1, acc2, startAt, endAt } =
    //         await loadFixture(deployEnglishAuction);

    //       const assetID_1 = 1;

    //       await nft.connect(owner).safeMint(acc1.address, assetID_1);
    //       await nft.connect(acc1).approve(auction.address, assetID_1);

    //       await token.increaseAllowance(auction.address, 100);
    //       await token.increaseAllowance(acc2.address, 100);

    //       await token.connect(owner).mint(acc2.address, 100);

    //       await token.connect(acc2).approve(auction.address, 100);

    //       await expect(
    //         auction
    //           .connect(acc1)
    //           .listAsset(
    //             assetID_1,
    //             token.address,
    //             nft.address,
    //             10,
    //             await time.latest(),
    //             endAt
    //           )
    //       ).to.be.revertedWith("future start only");

    //       await expect(
    //         auction
    //           .connect(acc1)
    //           .listAsset(assetID_1, token.address, nft.address, 10, endAt, startAt)
    //       ).to.be.revertedWith("ends after starts only");

    //       await expect(
    //         auction
    //           .connect(acc2)
    //           .listAsset(assetID_1, token.address, nft.address, 10, startAt, endAt)
    //       ).to.be.revertedWith("only owner");

    //       await expect(
    //         auction
    //           .connect(acc1)
    //           .listAsset(
    //             assetID_1,
    //             token.address,
    //             token.address,
    //             10,
    //             startAt,
    //             endAt
    //           )
    //       ).to.be.revertedWith("not an ERC721");

    //       await expect(
    //         auction
    //           .connect(acc1)
    //           .listAsset(assetID_1, token.address, nft.address, 10, startAt, endAt)
    //       )
    //         .to.emit(auction, "AssetListed")
    //         .withArgs(acc1.address, assetID_1, 10, token.address);

    //       await expect(
    //         auction.connect(acc2).placeBid(assetID_1, 100)
    //       ).to.be.revertedWith("auction yet to start");

    //       await time.increaseTo(startAt);

    //       await expect(auction.connect(acc2).placeBid(assetID_1, 100))
    //         .to.emit(auction, "Bid")
    //         .withArgs(acc2.address, assetID_1, 100, token.address);

    //       await expect(
    //         auction.connect(owner).finishAuction(assetID_1)
    //       ).to.be.revertedWith("auction in progress");

    //       await expect(auction.connect(owner).finishAuction(2)).to.be.revertedWith(
    //         "non listed asset"
    //       );

    //       await time.increaseTo(endAt);

    //       await expect(auction.connect(owner).finishAuction(assetID_1))
    //         .to.emit(auction, "Sale")
    //         .withArgs(assetID_1, acc2.address, 100, token.address);
    //     });

    //     it("Should bid below min auction correctly", async function () {
    //       const { token, auction, nft, owner, acc1, acc2, startAt, endAt } =
    //         await loadFixture(deployEnglishAuction);

    //       const assetID_1 = 1;

    //       await nft.connect(owner).safeMint(acc1.address, assetID_1);
    //       await nft.connect(acc1).approve(auction.address, assetID_1);

    //       await token.increaseAllowance(auction.address, 100);
    //       await token.increaseAllowance(acc2.address, 100);

    //       await token.connect(owner).mint(acc2.address, 100);

    //       await token.connect(acc2).approve(auction.address, 100);

    //       await expect(
    //         auction
    //           .connect(acc1)
    //           .listAsset(assetID_1, token.address, nft.address, 100, startAt, endAt)
    //       )
    //         .to.emit(auction, "AssetListed")
    //         .withArgs(acc1.address, assetID_1, 100, token.address);

    //       await expect(
    //         auction.connect(acc2).placeBid(assetID_1, 50)
    //       ).to.be.revertedWith("auction yet to start");

    //       await time.increaseTo(startAt);

    //       await expect(
    //         auction.connect(acc2).placeBid(assetID_1, 50)
    //       ).to.be.revertedWith("min bid is higher");

    //       await time.increaseTo(endAt);

    //       await expect(auction.connect(owner).finishAuction(assetID_1))
    //         .to.emit(auction, "Withdraw")
    //         .withArgs(assetID_1, acc1.address);
    //     });

    //     it("Should bid and loose auction correctly", async function () {
    //       const { token, auction, nft, owner, acc1, acc2, acc3, startAt, endAt } =
    //         await loadFixture(deployEnglishAuction);

    //       const assetID_1 = 1;

    //       await nft.connect(owner).safeMint(acc1.address, assetID_1);
    //       await nft.connect(acc1).approve(auction.address, assetID_1);

    //       await token.increaseAllowance(auction.address, 100);
    //       await token.increaseAllowance(acc2.address, 100);
    //       await token.increaseAllowance(acc3.address, 100);

    //       await token.connect(owner).mint(acc2.address, 100);
    //       await token.connect(owner).mint(acc3.address, 100);

    //       await token.connect(acc2).approve(auction.address, 100);
    //       await token.connect(acc3).approve(auction.address, 100);

    //       await expect(
    //         auction
    //           .connect(acc1)
    //           .listAsset(assetID_1, token.address, nft.address, 10, startAt, endAt)
    //       )
    //         .to.emit(auction, "AssetListed")
    //         .withArgs(acc1.address, assetID_1, 10, token.address);

    //       await expect(
    //         auction.connect(acc2).placeBid(assetID_1, 50)
    //       ).to.be.revertedWith("auction yet to start");

    //       await time.increaseTo(startAt);

    //       await expect(auction.connect(acc2).placeBid(assetID_1, 50))
    //         .to.emit(auction, "Bid")
    //         .withArgs(acc2.address, assetID_1, 50, token.address);

    //       await expect(
    //         auction.connect(acc3).placeBid(assetID_1, 50)
    //       ).to.be.revertedWith("last bid is higher");

    //       await expect(auction.connect(acc3).placeBid(assetID_1, 100))
    //         .to.emit(auction, "BidReturn")
    //         .withArgs(acc2.address, assetID_1, 50, token.address);

    //       await time.increaseTo(endAt);

    //       await expect(auction.connect(owner).finishAuction(assetID_1))
    //         .to.emit(auction, "Sale")
    //         .withArgs(assetID_1, acc3.address, 100, token.address);

    //       await expect(
    //         auction.connect(acc2).placeBid(assetID_1, 50)
    //       ).to.be.revertedWith("asset not listed");
    //     });
    //   });
});
