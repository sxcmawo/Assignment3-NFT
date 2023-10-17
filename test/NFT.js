const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", function () {
    let NFT, nft;
    let owner, addr1, addr2;
    const cost = ethers.utils.parseEther("0.001");
    const maxSupply = 15;

    beforeEach(async function () {
        NFT = await ethers.getContractFactory("NFT");
        [owner, addr1, addr2] = await ethers.getSigners();
        nft = await NFT.deploy();
    });

    describe("Deployment", function() {
        it("Should set the right name and symbol", async function () {
            expect(await nft.name()).to.equal("Alien Cats");
            expect(await nft.symbol()).to.equal("AC");
        });

    });

    describe("Minting", function() {
        it("Should mint token when sending correct ether amount", async function () {
            await expect(nft.connect(addr1).safeMint(addr1.address, { value: cost }))
                .to.emit(nft, "Transfer")
                .withArgs(ethers.constants.AddressZero, addr1.address, 0);
            expect(await nft.totalSupply()).to.equal(1);
        });

        it("Should not mint more than maxSupply", async function () {
            for (let i = 0; i < maxSupply; i++) {
                await nft.connect(addr1).safeMint(addr1.address, { value: cost });
            }
            await expect(nft.connect(addr2).safeMint(addr2.address, { value: cost }))
                .to.be.revertedWith("You reached maximum!");
        });

        it("Should revert when sending incorrect ether amount", async function () {
            await expect(nft.connect(addr1).safeMint(addr1.address, { value: cost.sub(1) }))
                .to.be.revertedWith("Please, add amount value");
        });
    });

    describe("Token URI", function() {
        it("Should return the correct baseURI through tokenURI", async function() {
            await nft.safeMint(owner.address, { value: cost });
            const tokenId = 0;
            const expectedTokenURI = "ipfs://QmcnK4iRmhEHRDBcQja9RPuNgWbMAPgpUGmqZmcbA3uYvv/" + tokenId.toString() + ".json";
            const actualTokenURI = await nft.tokenURI(tokenId);
            expect(actualTokenURI).to.equal(expectedTokenURI);
        });

        it("Should return correct tokenURI", async function () {
            await nft.connect(addr1).safeMint(addr1.address, { value: ethers.utils.parseEther("0.001") });
            expect(await nft.tokenURI(0)).to.equal("ipfs://QmcnK4iRmhEHRDBcQja9RPuNgWbMAPgpUGmqZmcbA3uYvv/0.json");
          });

        it("Should revert when querying tokenURI of non-owned token", async function () {
            await expect(nft.tokenURI(0)).to.be.reverted;
        });

    });

    describe("Withdrawal", function() {
        it("Should allow only owner to withdraw", async function () {
            await nft.connect(addr1).safeMint(addr1.address, { value: cost });
            await expect(nft.connect(addr1).withdraw()).to.be.reverted;
            await expect(nft.connect(owner).withdraw()).to.not.be.reverted;
        });

        it("Should transfer the correct amount to the owner", async function () {
            await nft.connect(addr1).safeMint(addr1.address, { value: cost });
            const initialBalance = await owner.getBalance();
            const tx = await nft.withdraw();
            const txReceipt = await tx.wait();
            const gasUsed = txReceipt.gasUsed.mul(tx.gasPrice);
            const finalBalance = await owner.getBalance();
            expect(finalBalance).to.equal(initialBalance.add(cost).sub(gasUsed));
        });

        it("Should leave the contract with 0 balance after withdrawal", async function () {
            await nft.connect(addr1).safeMint(addr1.address, { value: cost });
            await nft.withdraw();
            expect(await ethers.provider.getBalance(nft.address)).to.equal(0);
        });
    });
});
