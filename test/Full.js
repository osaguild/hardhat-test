const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("token contract", function () {
  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    hardhatToken = await Token.deploy();
  });

  describe("deployment", function () {
    it("should set right owner", async function () {
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });
    it("should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("transactions", function () {
    it("should transfer tokens between accounts", async function () {
      await hardhatToken.transfer(addr1.address, 50);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
      await hardhatToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
    it("should fail if sender does not have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
      await expect(hardhatToken.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith("not enough tokens");
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });
    it("should update balances after trasfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
      await hardhatToken.transfer(addr1.address, 100);
      await hardhatToken.transfer(addr2.address, 50);
      const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);
      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});