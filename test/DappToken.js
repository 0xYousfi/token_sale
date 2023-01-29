var DappToken = artifacts.require("./DappToken.sol")


contract('DappToken', async (accounts) => {

    let token;
    it('sets the total supply upon deployment', async () => {

         token = await DappToken.deployed();
         let totalSupply = await token.totalSupply();
        assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
        }
    )
    })