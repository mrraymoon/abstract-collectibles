const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Abstraction", function () {
  it("Should Mint the right quantity of NFT", async function () {
    const Abstraction = await ethers.getContractFactory("Abstraction");
    const abstraction = await Abstraction.deploy("");
    await abstraction.deployed();

    expect(await abstraction.mint()).to.equal("1");

  });

  it ("Should transfer the right amount to the NFT buyer", async function() {
    const AbsContract = await ethers.getContractFactory("Abstraction")
    const contract = await AbsContract.deploy()
    await contract.deployed()

  })
});
