import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";
dotenv.config();
const ERC20_CONTRACT = process.env.ERC20 || '';
const ERC721: string = process.env.ERC721 || '';
const NFT_AUCTION_CONTRACT_ADDRESS = process.env.NFT_AUCTION_CONTRACT_ADDRESS || '';
task("mint", "Mint new NFT")
    .addParam("to", "NFT owner")
    .addParam("id", "NFT Id")
    .setAction(async (taskArgs: { to: any; tokenId: any }, hre) => {
        const myErc70 = await hre.ethers.getContractAt("MyErc721", ERC721);
        const [account] = await hre.ethers.getSigners();
        let tx_1 = await myErc70.mintNFT(taskArgs.to, taskArgs.tokenId);
        console.log(`MIntend NFT ${taskArgs.tokenId} ETH, tx: ${tx_1.hash}, by ${account.address}`);
    });

task("listNFTOnAuction", "list NFT")
    .addParam("minPrice", "NFT price")
    .addParam("tokenId", "NFT Id")
    .addParam("numberOfDays", "number of days")
    .addParam("MyErc721", "MyErc721 address")
    .setAction(async (taskArgs: { minPrice: any; tokenId: any, numberOfDays: any, MyErc721: any }, hre) => {
        const NFTAuction = await hre.ethers.getContractAt("NFTAuction", NFT_AUCTION_CONTRACT_ADDRESS);
        const erc20 = await hre.ethers.getContractAt("MyErc20", ERC20_CONTRACT);
        erc20.increaseAllowance(NFT_AUCTION_CONTRACT_ADDRESS, taskArgs.minPrice)
        const [account] = await hre.ethers.getSigners();
        let tx_1 = await NFTAuction.listNFTOnAuction(taskArgs.tokenId, taskArgs.minPrice, taskArgs.numberOfDays, taskArgs.MyErc721);
        console.log(`listed NFT ${taskArgs.tokenId} ETH, tx: ${tx_1.hash}, by ${account.address}`);
    });
