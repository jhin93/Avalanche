
// As you can see, it is pretty straightforward. We import the contracts and deploy them via the deployer parameter. This is taken care by Truffle.
const Collectible = artifacts.require('Collectible')
const Marketplace = artifacts.require('Marketplace')

module.exports = function (deployer) {
    deployer.deploy(Collectible)
    deployer.deploy(Marketplace)
} as Truffle.Migration

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export { }


// 2.1. In order to deploy our contracts to the Fuji testnet, all we need to do is simply run the command:
// $ truffle migrate --network fuji
// And should we want to deploy to the Avalanche C-Chain, we simply run:
// $ truffle migrate --network mainnet