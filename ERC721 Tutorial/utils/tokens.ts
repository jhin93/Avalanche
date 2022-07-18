// We use the toBN() function to convert the balances of the addresses, which are returned as strings, to Big Numbers, so that we can perform an adding. 
// We also import a function convertTokenToWei from a utils/ folder of our project's root which we do not have yet, so let us create it and inside of it create a tokens.ts file. 
// Then copy the code below in there:

// We use this function, so that we do not have to write 18 zeroes after the AVAX amount that a buyer would pay for a NFT. 
// In reality, transfering 5 AVAX means that we transfer 5000000000000000000 as a value.
// In order to not have to write all those zeroes, we can simply call convertTokensToWei('5') and the function will add the zeroes for us. Now, back to our marketplace.test.ts test script.
export const convertTokensToWei = (n) => {
    return web3.utils.toWei(n, 'ether')
}

module.exports = { convertTokensToWei }