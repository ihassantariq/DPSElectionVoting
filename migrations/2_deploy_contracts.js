//Artifacts represents the contract abstraction
//Truffle expose contracts to inteact with contracts
//it can be anything

var Election = artifacts.require("./Election.sol"); //

module.exports = function(deployer) {
  deployer.deploy(Election);
};