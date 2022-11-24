import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NFTAuction", function () {
    const ONE_DAY_IN_SECS = 24 * 60 * 60;
    const TEN_DAYS_IN_SECS = 10 * 24 * 60 * 60;
    const zeroValue = ethers.constants.Zero;
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

    });


    it("listNFTOnAuction", async function () {
        const nftOwner = await erc721.ownerOf(nftId);
        console.log(nftOwner)
        await erc721.approve(auction.address, mintBid);
        // const { isListed, minBid, startAt, endAt, ONE_DAY_IN_SECS } = await auction;
        const tx = await auction.listNFTOnAuction(nftId, nftId, 1);
        await expect(tx).to.emit(auction, "ERC721Received").withArgs(acc0.address, nftId);
        // // expect(minBid).equal(mintBidEth);
        // // expect(startAt).equal(timestamp);
        // // expect(endAt).equal((timestamp + ONE_DAY_IN_SECS));
        // const nftOwner = await erc721.ownerOf(nftId);
        // expect(nftOwner).to.equal(zeroValue);
    });
    // it("display nft's owner properly", async function () {
    //     const nftOwner = await erc721.ownerOf(nftId);
    //     expect(nftOwner).to.equal(zeroValue);
    // });
});
