require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    //here we define all networks we will work with
    bnbtestnet: {
      url: "https://late-stylish-general.bsc-testnet.quiknode.pro/11f742175eff1008623bc79ff03d347b47020445/", //rpc from quicknode
      accounts: ["5711b04c8da9ee5ef178f965ac931d6888be87af2900fa403b7d01cfd36901aa"],
      chainId: 97,
    },
  },
  etherscan: {
    apiKey: "BSYWFNUTKVAGFAYT37IGTTB96BHCFBRP5U",
  },
  gasReporter: {
    enabled: true,
    outputFile: "gasReporter.txt",
    noColors: true
  }
};
