/* Copyright (C) 2020 PlotX.io

  This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

  This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/ */

pragma solidity 0.5.7;

import "./external/proxy/OwnedUpgradeabilityProxy.sol";
import "./interfaces/Iupgradable.sol";
import "./interfaces/IAuth.sol";
import "./interfaces/IToken.sol";

contract Master is IAuth {
    bytes2[] public allContractNames;
    address public dAppToken;
    address public initialAuthorizedAddress;
    bool public masterInitialised;

    mapping(address => bool) public contractsActive;
    mapping(bytes2 => address payable) public contractAddress;


    /**
     * @dev Initialize the Master.
     * @param _implementations The address of market implementation.
     * @param _token The address of PLOT token.
     */
    function initiateMaster(
        address[] calldata _implementations,
        address _token,
        address _defaultAddress,
        address _authMultiSig
    ) external {
        OwnedUpgradeabilityProxy proxy = OwnedUpgradeabilityProxy(
            address(uint160(address(this)))
        );
        require(!masterInitialised);
        require(msg.sender == proxy.proxyOwner(), "Sender is not proxy owner.");
        require(_token != address(0));
        require(_defaultAddress != address(0));
        require(_authMultiSig != address(0));
        masterInitialised = true;

        //Initial contract names
        // allContractNames.push("AM");
        allContractNames.push("BL");
        // allContractNames.push("DR");
        // allContractNames.push("CM");
        // allContractNames.push("AC");

        require(
            allContractNames.length == _implementations.length,
            "Implementation length not match"
        );
        contractsActive[address(this)] = true;
        dAppToken = _token;
        for (uint256 i = 0; i < allContractNames.length; i++) {
            _generateProxy(allContractNames[i], _implementations[i]);
        }

        authorized = _authMultiSig;
        initialAuthorizedAddress = _defaultAddress;
        _setMasterAddress();
    }

    /**
     * @dev adds a new contract type to master
     */
    function addNewContract(bytes2 _contractName, address _contractAddress)
        external
        onlyAuthorized
    {
        require(_contractName != "MS", "Name cannot be master");
        require(_contractAddress != address(0), "Zero address");
        require(
            contractAddress[_contractName] == address(0),
            "Contract code already available"
        );
        allContractNames.push(_contractName);
        _generateProxy(_contractName, _contractAddress);
        Iupgradable up = Iupgradable(contractAddress[_contractName]);
        up.setMasterAddress(authorized, initialAuthorizedAddress);
    }

    /**
     * @dev upgrades a multiple contract implementations
     */
    function upgradeMultipleImplementations(
        bytes2[] calldata _contractNames,
        address[] calldata _contractAddresses
    ) external onlyAuthorized {
        require(
            _contractNames.length == _contractAddresses.length,
            "Array length should be equal."
        );
        for (uint256 i = 0; i < _contractNames.length; i++) {
            require(
                _contractAddresses[i] != address(0),
                "null address is not allowed."
            );
            _replaceImplementation(_contractNames[i], _contractAddresses[i]);
        }
    }
    
    /**
     * @dev To check if we use the particular contract.
     * @param _address The contract address to check if it is active or not.
     */
    function isInternal(address _address) public view returns (bool) {
        return contractsActive[_address];
    }

    /**
     * @dev Gets latest contract address
     * @param _contractName Contract name to fetch
     */
    function getLatestAddress(bytes2 _contractName)
        public
        view
        returns (address)
    {
        return contractAddress[_contractName];
    }

    /**
     * @dev Changes Master contract address
     */
    function _setMasterAddress() internal {
        for (uint256 i = 0; i < allContractNames.length; i++) {
            Iupgradable up = Iupgradable(contractAddress[allContractNames[i]]);
            up.setMasterAddress(authorized, initialAuthorizedAddress);
        }
    }

    /**
     * @dev Replaces the implementations of the contract.
     * @param _contractsName The name of the contract.
     * @param _contractAddress The address of the contract to replace the implementations for.
     */
    function _replaceImplementation(
        bytes2 _contractsName,
        address _contractAddress
    ) internal {
        OwnedUpgradeabilityProxy tempInstance = OwnedUpgradeabilityProxy(
            contractAddress[_contractsName]
        );
        tempInstance.upgradeTo(_contractAddress);
    }

    /**
     * @dev to generator proxy
     * @param _contractAddress of the proxy
     */
    function _generateProxy(bytes2 _contractName, address _contractAddress)
        internal
    {
        OwnedUpgradeabilityProxy tempInstance = new OwnedUpgradeabilityProxy(
            _contractAddress
        );
        contractAddress[_contractName] = address(tempInstance);
        contractsActive[address(tempInstance)] = true;
    }
    
    /**
    * @dev Transfer `_amount` number of DAO assets to Dispute resolution contract for voting rewards
    */
    function withdrawForDRVotingRewards(uint _amount) external {
      require(msg.sender == contractAddress["DR"]);
      _transferAsset(dAppToken, msg.sender, _amount);
    }

    /**
    * @dev Transfer `_amount` of DAO assets to `_to` address
    */
    function transferAssets(address _asset, address payable _to, uint _amount) external onlyAuthorized {
      _transferAsset(_asset, _to, _amount);
    }

    /**
    * @dev Transfer the assets to specified address.
    * @param _asset The asset transfer to the specific address.
    * @param _recipient The address to transfer the asset of
    * @param _amount The amount which is transfer.
    */
    function _transferAsset(address _asset, address payable _recipient, uint256 _amount) internal {
      if(_amount > 0) { 
          require(IToken(_asset).transfer(_recipient, _amount));
      }
    }
}
