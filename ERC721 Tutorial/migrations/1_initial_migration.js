
// Now that our contracts have passed the tests, let us have a look at the sub-dir migrations/ folder which Truffle provided us in the beginning. 
// Inside of it we have the 1_initial_migration.ts script which is used to deploy the Migrations.sol contract that is available in the contracts/ folder. This contract simply keeps track of the migrations that we do. 
// In order to migrate our own contracts, we create another script called 2_deploy_contracts.ts and inside of it paste the following lines of code:

const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
