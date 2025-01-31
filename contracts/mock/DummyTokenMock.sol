pragma solidity 0.5.7;

import "../external/openzeppelin-solidity/token/ERC20/ERC20.sol";

// To branch coverage of token transer
contract DummyTokenMock is ERC20 {

    // string public name;
    // string public symbol;
    // uint8 public decimals = 18;

    mapping(address=>bool) _dummyBit;

    bool public retBit;

    constructor(string memory tokenName, string memory tokenSymbol) public {
        _name = tokenName;
        _symbol = tokenSymbol;
        _setupDecimals(18);
    }

    function mint(uint256 amount) public returns (uint256) {
        _mint(msg.sender, amount);
        return 0;
    }

    function setRetBit(bool _a) public {
        retBit = _a;
    }

     /**
    * @dev burns an amount of the tokens of the message sender
    * account.
    * @param amount The amount that will be burnt.
    */
    function burn(uint256 amount) public returns (bool) {
        _burn(msg.sender, amount);
        return true;
    }

    /**
    * @dev Transfer token for a specified address
    * @param to The address to transfer to.
    * @param value The amount to be transferred.
    */
    function transfer(address to, uint256 value) public returns (bool) {

        // _transfer(msg.sender, to, value); 
        return retBit;
    }

    /**
    * @dev Transfer tokens from one address to another
    * @param from address The address which you want to send tokens from
    * @param to address The address which you want to transfer to
    * @param value uint256 the amount of tokens to be transferred
    */
    function transferFrom(
        address from,
        address to,
        uint256 value
    )
        public
        returns (bool)
    {
        // _transferFrom(from, to, value);
        return retBit;
    }

    /**
    * @dev Gets the balance of the specified address.
    * @param owner The address to query the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address owner) public view returns (uint256) {
        return super.balanceOf(owner);
    }

    /**
    * @dev function that mints an amount of the token and assigns it to
    * an account.
    * @param account The account that will receive the created tokens.
    * @param amount The amount that will be created.
    */
    function mint(address account, uint256 amount) public returns(bool) {
        _mint(account, amount);
        return true;
    }

    function isLockedForGV(address _of) public view returns(bool) {
        return _dummyBit[_of];
    }

    function setDummyBit(address _of, bool _val) public {
        _dummyBit[_of] = _val;
    }
    
}
