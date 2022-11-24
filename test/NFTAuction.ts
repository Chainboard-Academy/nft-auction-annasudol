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
    before(async function () {
        await erc721.mintNFT(nftId);
        await auction.listNFTOnAuction(nftId, 1, 1);
    });


    it("display nft's value properly", async function () {
        // const { isListed, minBid, startAt, endAt, ONE_DAY_IN_SECS } = await auction;
        const isListed = await auction.isListed;
        const timestamp = (await auction.getBlock(0)).timestamp;
        expect(isListed).equal(true);
        // expect(minBid).equal(mintBidEth);
        // expect(startAt).equal(timestamp);
        // expect(endAt).equal((timestamp + ONE_DAY_IN_SECS));
    });
    it("display nft's owner properly", async function () {
        const nftOwner = await erc721.ownerOf(nftId);
        expect(nftOwner).to.equal(zeroValue);
    });
});
