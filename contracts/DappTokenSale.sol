pragma solidity >=0.4.21 <0.6.0;

import './DappToken.sol';

contract DappTokenSale {

    address payable admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(DappToken _token, uint256 _price) public {
        tokenContract = _token;
        admin = msg.sender;
        tokenPrice = _price;
    }

    // multiply
    function multiply(uint x, uint y ) internal pure returns(uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
        return z;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require the value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // Require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    // Ending Token DappTokenSale
    function endSale() public {
        // require admin to end the sale
        require(msg.sender == admin);
        // Transfer remaining dapp tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // destroy contract
        selfdestruct(admin);
    }
}