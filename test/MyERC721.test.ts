import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe('MyErc721', function () {
    const zero_address = ethers.constants.AddressZero;
    let owner: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let token: any;

    before(async function () {
        const myERC721 = await ethers.getContractFactory("MyErc721");
        [owner, account1, account2] = await ethers.getSigners();
        token = await myERC721.deploy();
    });
    describe('safeMint', () => {
        const tokenURl = 'tokenUrl';
        it('to the address successfully', async function () {
            const balance_account0 = await token.balanceOf(owner.address);
            let tx = token.safeMint(owner.address, 1, tokenURl);
            await expect(tx).to.emit(token, "Transfer").withArgs(zero_address, owner.address, 1);
            const new_balance_account0 = await token.balanceOf(owner.address);
            expect(new_balance_account0).to.equal(balance_account0.add(1));
        });
    });
    describe('after safeMint', () => {
        const tokenURl = 'tokenUrl_2';
        const tokenId = 0;
        before(async function () {
            token.safeMint(owner.address, tokenId, tokenURl);
        });
        it('show owner to be true by given tokenId', async function () {
            expect(await token.ownerOf(tokenId)).to.be.equal(owner.address);
        });
        it('revert due to trying add nft with the same URL', async function () {
            expect(token.safeMint(owner.address, 2, tokenURl)).to.be.rejectedWith('Token URI already exists')
        });
    });
})

