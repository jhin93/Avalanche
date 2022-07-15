// As you can see we import the Collectible contract and also an expectRevert function that will help us with checking whether the functions revert correctly upon false input.
const Collectible = artifacts.require('./Collectible')
import { expectRevert } from '@openzeppelin/test-helpers'

// contract()에 대한 설명. contract()는 describe()와 다르게 clean-room feature를 상시 발동한다. https://trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript/#use-contract-instead-of-describe-
contract('Collectible', ([contractDeployer, creator, buyer]) => { // first parameter is the contract name, the second is simply a list of addresses.
    let collectible;

    // Afterwards, we define a before() hook. This hook runs before our tests and we can use it to deploy the contract.
    before(async () => {
        // Note: We do not actually need {from: contractDeployer} as a parameter. If it is missing, Truffle would automatically take the first address into consideration for the function call.
        // However, you will see that for minting an NFT we would use the creator address, so we would then need to specify this. Each function of our contracts would be part of a describe() block. 
        // That way we can structure our tests efficiently, so that we can find our way easier.
        collectible = await Collectible.new({ from: contractDeployer })
    });

    // In the first describe() block we test whether our contract was deployed correctly. For that we need to write individual tests or it().
    describe('Collectible deployment', async () => {
        // In the first case, we check whether the collectible.address is not equal to those illegal values.
        it('Deploys the Collectible SC successfully.', async () => {
            console.log('Address is ', collectible.address)
            assert.notEqual(collectible.address, '', 'should not be empty');
            assert.notEqual(collectible.address, 0x0, 'should not be the 0x0 address');
            assert.notEqual(collectible.address, null, 'should not be null');
            assert.notEqual(collectible.address, undefined, 'should not be undefined');
        })
        // In the second test we check whether our Collectible.sol has a name and a symbol. 
        // Since those variables are public in the ERC721.sol implementation we can call them as getters. 
        // The value is stored in a variable and then this variable is compared to the expected name. 
        // If you jump to the Collectible.sol file you can see the expected name in the constructor().
        it('The collectible SC should have a name and a symbol.', async () => {
            const name = await collectible.name()
            assert.equal(name, 'NFTCollectible', 'The name should be NFTCollectible.')
            const symbol = await collectible.symbol()
            assert.equal(symbol, 'NFTC', 'The symbol should be NFTC.')
        })
    })
})