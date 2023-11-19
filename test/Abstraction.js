const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Abstraction", function () {
  it("Should Mint the right quantity of NFT", async function () {
    const Abstraction = await ethers.getContractFactory("Greeter");
    const abstraction = await Abstraction.deploy("Hello, world!");
    await abstraction.deployed();

    expect(await abstraction.mint()).to.equal("1");

  });
});
