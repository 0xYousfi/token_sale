var DappTokenSale = artifacts.require('./DappTokenSale.sol');
var DappToken = artifacts.require('./DappToken.sol');

contract('DappTokenSale', async (accounts) => {
    var tokenSaleInstance;
    var dappTokenInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 750000;
    var tokenPrice = 1000000000000000;
    it('initializes the contract with the correct values', async () => {
         tokenSaleInstance = await DappTokenSale.deployed();
        let tokenAddress = await tokenSaleInstance.address;
        assert.notEqual(tokenAddress, 0x0, 'has contract address');
        let address = await tokenSaleInstance.tokenContract();
        assert.notEqual(address, 0x0, 'has token contract address');

        let price = await tokenSaleInstance.tokenPrice();
        assert.equal(price, tokenPrice, 'token has the correct price');
    });

    it('facilitates token buying', async () => {
    // Grab token instance first 
    dappTokenInstance = await DappToken.deployed();
    // then grab token sale instance
    tokenSaleInstance = await DappTokenSale.deployed();
    let tokenSaleAddress = await tokenSaleInstance.address;
    // Provision of 75% of all tokens to the token sale contract
    let balanceAdmin = await dappTokenInstance.balanceOf(admin);
    await dappTokenInstance.transfer(tokenSaleAddress,tokensAvailable, {from : admin});
    let receipt = await tokenSaleInstance.buyTokens(10, { from : buyer , value : 10 * tokenPrice});
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
    assert.equal(receipt.logs[0].args._buyer, buyer, 'logs of the account that purchased the tokens');
    assert.equal(receipt.logs[0].args._amount, 10, 'logs the transfer amount');
    let tokensSold  = await tokenSaleInstance.tokensSold();
    assert.equal(tokensSold, 10, ' correct number of tokens sold');
    
    let balance = await dappTokenInstance.balanceOf(tokenSaleAddress);
    assert.equal(balance.toNumber(), tokensAvailable - 10, 'Correct amount on the contract');

    await tokenSaleInstance.buyTokens(10, { from : buyer , value : 1}).then(assert.fail).catch((error) => {
        assert(error.message.toString().indexOf('revert')>= 0, 'msg.value must equal number of tokens in WEI');
    });
    await tokenSaleInstance.buyTokens(800000, { from : buyer , value : 10* tokenPrice}).then(assert.fail).catch((error) => {
        assert(error.message.toString().indexOf('revert')>= 0, 'Cannot purchase higher');
    });
    })

    it('ends token sale', async () => {
        dappTokenInstance = await DappToken.deployed();
        tokenSaleInstance = await DappTokenSale.deployed();

        await tokenSaleInstance.endSale({ from : buyer}).then(assert.fail).
        catch((error) => {
            assert(error.message.toString().indexOf('revert') >= 0, 'must be admin to end the sale');
        })
        let balanceAdminBefore = await dappTokenInstance.balanceOf(admin);
        console.log(balanceAdminBefore.toNumber(), ' before ending sale');

        await tokenSaleInstance.endSale({from : admin});

        let balanceAdmin = await dappTokenInstance.balanceOf(admin);
        console.log(balanceAdmin.toNumber(), ' after ending sale');

        assert.equal(balanceAdmin.toNumber(), 999990, 'returns all unsold dapp tokens to admin');
    })
})

