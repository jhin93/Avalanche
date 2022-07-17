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

    // In the second describe() block we test our createCollectible() function. For that we need to write individual tests for every statement that we make.
    describe('Mint an NFT and set a royalty.', async () => {

        // First we check that the 'metadata' is not minted. For that we call the hasBeenMinted('metadata') function which is in fact our mapping in our Collectible.sol file. This returns us a boolean which is false.
        it('The hash \'metadata\' is not minted before the function call.', async () => {
            const hasBeenMinted = await collectible.hasBeenMinted('metadata')
            assert.equal(hasBeenMinted, false, 'The hash \'metadata\' has not been minted, so it should be false.')
        })

        // Afterwards, we expect that the minting function reverts if we provide a royalty that is not between 0% and 40%. In that case we try with 41%.
        it('The royalty needs to be a number between 0 and 40.', async () => {
            await expectRevert(collectible.createCollectible('metadata', 41), "Royalties must be between 0% and 40%.");
        })

        // Then, before we complete the transaction we can check what the return value would be. 
        // As we know, our createCollectible() function returns a token id. We can grab this by executing the function without changing the state:
        it('Give a new id to a newly created token', async () => {
            const newTokenId = await collectible.createCollectible.call('metadata', 20, { from: creator })
            // Then we simply compare the newTokenId to 1 and expect them to be equal, since our first NFT should have the token id 1.
            assert.equal(parseInt(newTokenId.toString()), 1, 'The new token id should be 1.')
        })

        // Now we do not only exectute the createCollectible() function but also change the state in our next it():

        // Our variable which is the result of the function call is no longer the token id, but a transaction receipt, meaning that we obtain much more information out of it.
        // Cool, right? Let us put this information to use. We test whether the correct events are emitted since they are the signal that we need. In this case we have two.
        it('Mint a NFT and emit events.', async () => {
            const result = await collectible.createCollectible('metadata', 20, { from: creator })
            assert.equal(result.logs.length, 2, 'Should trigger two events.');
            //One is the Transfer event which comes from the _safeMint(msg.sender, newItemId) function of the ERC721.sol smart contract.
            //event Transfer
            assert.equal(result.logs[0].event, 'Transfer', 'Should be the \'Transfer\' event.');
            assert.equal(result.logs[0].args.from, 0x0, 'Should be the 0x0 address.');
            assert.equal(result.logs[0].args.to, creator, 'Should log the recipient which is the creator.');
            assert.equal(result.logs[0].args.tokenId, 1, 'Should log the token id which is 1.');

            //The other one is our own ItemMinted event. We check for the correct name and the correct arguments.
            //event ItemMinted
            assert.equal(result.logs[1].event, 'ItemMinted', 'Should be the \'ItemMinted\' event.');
            assert.equal(result.logs[1].args.tokenId, 1, 'Should be the token id 1.');
            assert.equal(result.logs[1].args.creator, creator, 'Should log the creator.');
            assert.equal(result.logs[1].args.metadata, 'metadata', 'Should log the metadata correctly.');
            assert.equal(result.logs[1].args.royalty, 20, 'Should log the royalty as 20.');
        })

        // In the remaining it()-s we check whether the mappings were updated accordingly and whether our Item has the correct values. 
        // Our final it() makes sure that the transaction reverts if we call the createCollectible() function with the same metadata parameter value.
        it('The items array has a length of 1.', async () => {
            const itemsLength = await collectible.getItemsLength()
            assert.equal(itemsLength, 1, 'The items array should have 1 entry in it.')
        })

        it('The new item has the correct data.', async () => {
            const item = await collectible.getItem(1)
            assert.notEqual(item['0'], buyer, 'The buyer should not be the creator.')
            assert.equal(item['0'], creator, 'The creator is the owner.')
            assert.equal(item['1'], creator, 'The creator is the creator.')
            assert.equal(item['2'], 20, 'The royalty is set to 20.')
        })

        it('Check if hash has been minted and that you cannot mint the same hash again.', async () => {
            const hasBeenMinted = await collectible.hasBeenMinted('metadata')
            assert.equal(hasBeenMinted, true, 'The hash \'metadata\' has been minted.')
            await expectRevert(collectible.createCollectible('metadata', 30, { from: creator }), 'This metadata has already been used to mint an NFT.');
        })
    })
})
// Now that we are done writing the test, in our console we simply run the command:
// npx truffle test
// Note: You might notice that this would run the command truffle compile beforehand. 
// This would create a build/contracts folder in our root directory where the .json representations of all of our used contracts are stored. 
// These are in fact used when you call functions on the frontend.