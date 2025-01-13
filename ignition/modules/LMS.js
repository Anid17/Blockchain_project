// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { etherscan } = require("../../hardhat.config");

module.exports = buildModule("LibraryModule", (m) => {
  const LMS = m.contract("Library");
  return { LMS };
});

// Ensure your etherscan configuration is placed outside the buildModule function:
module.exports.etherscan = {
  apiKey: "VDQX643Y38VNTPGYKC7AA9SF328NG4Q8HV", // Your etherscan API key
};
