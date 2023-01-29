var DappToken = artifacts.require("./DappToken.sol");

module.exports = async function(deployer) {
  await deployer.deploy(DappToken,1000000);
};