pragma solidity >=0.4.21 <0.6.0;

contract DappToken {
    // Constructor
    // Set the total number of tokens
    // Read the total number of tokens
    // Name
    // Symbol
    string public name = "DApp Token";
    string public symbol = 'DAPP';
    string public standard = 'DApp Token v1.0';
    uint256 public totalSupply;


    event Transfer (
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) public {

        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer
    function transfer(address _to, uint256 _value) public returns (bool success) {
    // Exception if account doesn't have enough tokens
    require(balanceOf[msg.sender]>= _value);
    // transfer the balance 😄
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;
    // Transfer Event
    emit Transfer(msg.sender, _to, _value);
    // returns a Boolean
    return true;

    }

}