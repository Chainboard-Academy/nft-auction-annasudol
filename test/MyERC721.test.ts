import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe('myERC721', function () {
    const zero_address = ethers.constants.AddressZero;
    let owner: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let token: any;

    before(async function () {
        const myERC721 = await ethers.getContractFactory("myERC721");
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
})

