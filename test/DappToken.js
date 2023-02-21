
var DappToken = artifacts.require("./DappToken.sol")


contract('DappToken', async (accounts) => {

    let token;
    it('initializes the contracts with the correct values', async () => {
        let token = await DappToken.deployed();
        let name = await token.name();
        let symbol = await token.symbol();
        let standard = await token.standard();
        assert.equal(name, 'DApp Token', 'has the correct name');
        assert.equal(symbol, 'DAPP', 'has the correct symbol');
        assert.equal(standard, 'DApp Token v1.0', 'has the correct standard');
    })
    it('Allocates the total supply upon deployment', async () => {

         token = await DappToken.deployed();
         let totalSupply = await token.totalSupply();
        assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');

        let balance = await token.balanceOf(accounts[0]);
        assert.equal(balance.toNumber(), 1000000, 'it allocates the initial supply to the admin account');
        }
    )

    it('transfers token ownership', async () => {
        var token = await DappToken.deployed();
        // test 'require' statement first by transferring something larger than the sender's balance
        await token.transfer.call(accounts[1], 9999999999999).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert')>= 0, 'error message must containt revert');
        });
        var result = await token.transfer.call(accounts[1], 25000, { from : accounts[0]})
        assert.equal(result,true, 'return the success code for transferring balance');
        let receipt = await token.transfer(accounts[1], 25000, { from : accounts[0]});
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 25000, 'logs the transfer amount');
        let balance = await token.balanceOf(accounts[1]);
        let remainingBalance = await token.balanceOf(accounts[0]);
        assert.equal(balance.toNumber(), 25000, 'addes the balance to the receiving account');
        assert.equal(remainingBalance.toNumber(), 975000, 'substracts the balance from the sending account');
    })

    it('approves token for delegated transfer', async () => {
        var token = await DappToken.deployed();
        let approval = await token.approve.call(accounts[1], 100);
        assert.equal(approval, true, 'it returns true');
        let approveTransaction = await token.approve(accounts[1], 100, { from : accounts[0] });
        assert.equal(approveTransaction.logs.length, 1, 'triggers one event');
        assert.equal(approveTransaction.logs[0].event, 'Approval', 'should be the "Approval" event');
        assert.equal(approveTransaction.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
        assert.equal(approveTransaction.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
        assert.equal(approveTransaction.logs[0].args._value, 100, 'logs the transfer amount');

        let allowance = await token.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
    })

    it('handles a delegated token transfers', async () => {
        var token = await DappToken.deployed();
        let fromAccount = accounts[2];
        let toAccount = accounts[3];
        let spendingAccount = accounts[4];

        // Transfer some tokens to fromAccount
        let transfer = await token.transfer(fromAccount,100, { from : accounts[0]});
        // Approve spendingAccount to spend 10 tokens from fromAccount
        let approval = await token.approve(spendingAccount, 10, { from : fromAccount })
        let biggerApproval = await token.transferFrom(fromAccount, toAccount, 2000, { from : spendingAccount}).then(assert.fail).catch(
             (error) => {
                assert(error.message.toString().indexOf('revert')>= 0, 'cant invest larger');
            }
        );
        // Try transferring lagrger than the approved amount 
        let transferlarger = await token.transferFrom(fromAccount, toAccount, 20, {from : spendingAccount}).then(assert.fail).catch( (error) => {
            assert(error.message.toString().indexOf('revert') >= 0 , 'balance agreed not enough');
        });
        let success = await token.transferFrom.call(fromAccount, toAccount, 10, { from : spendingAccount});
        assert.equal(success, true, ' success');
        let receipt = await token.transferFrom(fromAccount, toAccount, 10, { from : spendingAccount});
        let balance = await token.balanceOf(fromAccount);
        assert.equal(balance.toNumber(), 90,'remaining');
        let receivedAccount = await token.balanceOf(toAccount);
        assert.equal(receivedAccount.toNumber(), 10, 'account balance after transfer');
        let allowance = await token.allowance(fromAccount, spendingAccount);
        assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
    })
    })