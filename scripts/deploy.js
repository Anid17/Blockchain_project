const hre = require("hardhat");

async function main() {
  // Get the contract factory for Library
  const Library = await hre.ethers.getContractFactory("Library");

  // Deploy the contract
  const library = await Library.deploy();

  // Wait for the deployment to finish
  await library.deployed();

  // Log the deployed contract address
  console.log(`Library contract deployed to: ${library.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


  