import { ethers } from "hardhat";


async function main() {
    const CONTRACT = await ethers.getContractFactory("NftMarket");
    const contract = await CONTRACT.deploy();
    await contract.deployed();
    console.log("Migrations deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
