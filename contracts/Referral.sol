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

import "./external/openzeppelin-solidity/math/SafeMath.sol";
import "./external/proxy/OwnedUpgradeabilityProxy.sol";
import "./external/NativeMetaTransaction.sol";
import "./interfaces/IMaster.sol";
import "./interfaces/IAllMarkets.sol";
import "./interfaces/IToken.sol";
import "./interfaces/IAuth.sol";

contract Referral is IAuth, NativeMetaTransaction {

    event ReferralLog(address indexed referrer, address indexed referee, uint256 referredOn);
    event ClaimedReferralReward(address indexed user, address token, uint256 amount);

    struct UserData {
      mapping(address => uint256) referrerFee; // Fee earned by referring another user for a given token
      mapping(address => uint256) refereeFee; // Fee earned after being referred by another user for a given token
      address referrer; // Address of the referrer 
    }

    IAllMarkets internal allMarkets;
    address internal masterAddress;
    
    uint internal predictionDecimalMultiplier;

    mapping (address => UserData) public userData;

    modifier onlyInternal {
      IMaster(masterAddress).isInternal(msg.sender);
      _;
    }

    /**
     * @dev Initialize the dependencies
     * @param _masterAddress Master address of the PLOT platform.
     */
    constructor(address _masterAddress) public {
      IMaster ms = IMaster(_masterAddress);
      authorized = ms.authorized();
      masterAddress = _masterAddress;
      allMarkets = IAllMarkets(ms.getLatestAddress("AM"));
      predictionDecimalMultiplier = 10;
      _initializeEIP712("RF");
    }

    /**
    * @dev Set referrer address of a user, can be set only by the authorized users
    * @param _referrer User who is referring new user
    * @param _referee User who is referring new user
    */
    function setReferrer(address _referrer, address _referee) external onlyAuthorized {
      require(_referrer != address(0) && _referee != address(0));
      UserData storage _userData = userData[_referee];
      require(allMarkets.getTotalStakedByUser(_referee) == 0);
      require(_userData.referrer == address(0));
      _userData.referrer = _referrer;
      emit ReferralLog(_referrer, _referee, now);
    }

    /**
    * @dev Set referral reward data
    * @param _referee User who is referring new user
    * @param _token Address of token in which reward is issued
    * @param _referrerFee Fees earned by referring other users
    * @param _refereeFee Fees earned if referred by some one
    * @return _isEligible Defines if the given user is eligible for the reward
    */
    function setReferralRewardData(address _referee, address _token, uint _referrerFee, uint _refereeFee) external onlyInternal returns(bool _isEligible) {
      UserData storage _userData = userData[_referee];
      address _referrer = _userData.referrer;
      if(_referrer != address(0)) {
        _isEligible = true;
        //Commission for referee
        _userData.refereeFee[_token] = _userData.refereeFee[_token].add(_refereeFee);
        //Commission for referrer
        userData[_referrer].referrerFee[_token] = userData[_referrer].referrerFee[_token].add(_referrerFee);
      }
    }

    /**
    * @dev Get fees earned by participating in the referral program
    * @param _user Address of the user
    * @return _referrerFee Fees earned by referring other users
    * @return _refereeFee Fees earned if referred by some one
    */
    function getReferralFees(address _user, address _token) external view returns(uint256 _referrerFee, uint256 _refereeFee) {
      UserData storage _userData = userData[_user];
      return (_userData.referrerFee[_token], _userData.refereeFee[_token]);
    }

    /**
    * @dev Claim the fee earned by referrals
    * @param _user Address to claim the fee for
     */
    function claimReferralFee(address _user, address _token) external {
      UserData storage _userData = userData[_user];
      uint256 _referrerFee = _userData.referrerFee[_token];
      delete _userData.referrerFee[_token];
      uint256 _refereeFee = _userData.refereeFee[_token];
      delete _userData.refereeFee[_token];
      uint _tokenToTransfer = (_refereeFee.add(_referrerFee)).mul(10**predictionDecimalMultiplier);
      _transferAsset(_token, _user, _tokenToTransfer);
      emit ClaimedReferralReward(_user, _token, _tokenToTransfer);
    }

    /**
    * @dev Transfer the _asset to specified address.
    * @param _recipient The address to transfer the asset of
    * @param _amount The amount which is transfer.
    */
    function _transferAsset(address _asset, address _recipient, uint256 _amount) internal {
      if(_amount > 0) { 
          require(IToken(_asset).transfer(_recipient, _amount));
      }
    }

}