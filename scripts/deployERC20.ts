import { ethers } from "hardhat";

async function main() {
    const CONTRACT = await ethers.getContractFactory("MyErc20");
    const contract = await CONTRACT.deploy();
    await contract.deployed();
    console.log("MyErc20 deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
