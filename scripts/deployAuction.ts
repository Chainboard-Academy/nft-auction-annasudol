import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();
const erc20_contract = process.env.ERC20 || '';

async function main() {
    const CONTRACT = await ethers.getContractFactory("NFTAuction");
    const contract = await CONTRACT.deploy(erc20_contract);
    await contract.deployed();
    console.log("NFTAuction deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
