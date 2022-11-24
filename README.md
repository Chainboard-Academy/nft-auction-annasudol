# NFT auction

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

## erc20 contract goerli
### 0xDC18BB3Ac97071e6A39f37AdbDca12B95788D25F

[contract at goerli.etherscan.io] (https://goerli.etherscan.io/address/0xDC18BB3Ac97071e6A39f37AdbDca12B95788D25F#code)

## erc721 contract goerli
### 0xd8CE61BDf2c839c0Fd3fB839E334759cFF7F96f3
[contract at goerli.etherscan.io] (https://goerli.etherscan.io/address/0xA0f938b0f34D102d87992B1EE7c24FAaF19B1dB1#code)

## erc721 contract goerli
### 0xd8CE61BDf2c839c0Fd3fB839E334759cFF7F96f3
[contract at goerli.etherscan.io] (https://goerli.etherscan.io/address/0xd8CE61BDf2c839c0Fd3fB839E334759cFF7F96f3#code)

## NFTAuction contract auction
### 0x49C1Ab40947f70457b35749BAc94b21991E35d4D
[contract at goerli.etherscan.io] (https://goerli.etherscan.io/address/0x49C1Ab40947f70457b35749BAc94b21991E35d4D#code)

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```


npx hardhat run scripts/deployAuction.ts --network goerli
npx hardhat verify 0x49C1Ab40947f70457b35749BAc94b21991E35d4D 0xDC18BB3Ac97071e6A39f37AdbDca12B95788D25F 0xd8CE61BDf2c839c0Fd3fB839E334759cFF7F96f3 --network goerli
ERC20='0xDC18BB3Ac97071e6A39f37AdbDca12B95788D25F'
ERC721='0xd8CE61BDf2c839c0Fd3fB839E334759cFF7F96f3'