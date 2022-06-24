// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const Abstraction = await hre.ethers.getContractFactory("Abstraction");
  const abstraction = await Abstraction.deploy();

  await abstraction.deployed();

  console.log("Abstraction contract deployed to:", abstraction.address);
  storeContractData(abstraction);
}

function storeContractData(contract) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/Abstraction-address.json",
    JSON.stringify({ Abstraction: contract.address }, undefined, 2)
  );

  const MultaVerseArtifact = artifacts.readArtifactSync("Abstraction");

  fs.writeFileSync(
    contractsDir + "/Abstraction.json",
    JSON.stringify(MultaVerseArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });