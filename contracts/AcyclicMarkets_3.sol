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

import "./AcyclicMarkets_2.sol";

contract AcyclicMarkets_3 is AcyclicMarkets_2 {
  address public authToSettleMarkets; // Authorized address to settlemarkets
  uint[] internal initialPredictions;

  /**
  * @dev Create the market.
  */
  function createMarketWithVariableLiquidity(string memory _questionDetails, uint64[] memory _optionRanges, uint32[] memory _marketTimes,bytes8 _marketType, bytes32 _marketCurr, uint64[] memory _marketInitialLiquidities) public {
    uint64 _initialLiquidity;
    for(uint i = 0;i < _marketInitialLiquidities.length; i++) {
      _initialLiquidity = _initialLiquidity.add(_marketInitialLiquidities[i]);
    }
    initialPredictions = _marketInitialLiquidities;
    initialPredictions.push(_initialLiquidity);
    super.createMarketWithVariableLiquidity(_questionDetails, _optionRanges, _marketTimes, _marketType, _marketCurr, _marketInitialLiquidities);
    delete initialPredictions;
  }

  /**
  * @dev Update the authorized address to settle markets
  * @param _newAuth Address to update
  */
  function changeAuthAddressToSettleMarkets(address _newAuth) external onlyAuthorized {
    require(_newAuth != address(0));
    authToSettleMarkets = _newAuth;
  }

  /**
  * @dev Settle the market, setting the winning option
  * @param _marketId Index of market
  */
  function settleMarket(uint256 _marketId, uint _answer) public {
    require(_msgSender() ==  authToSettleMarkets);
    allMarkets.settleMarket(_marketId, _answer);
    if(allMarkets.marketStatus(_marketId) >= IAllMarkets.PredictionStatus.InSettlement) {
      _transferAsset(plotToken, masterAddress, (10**predictionDecimalMultiplier).mul(marketFeeParams.daoFee[_marketId]));
      delete marketFeeParams.daoFee[_marketId];

      marketCreationReward[marketData[_marketId].marketCreator] = marketCreationReward[marketData[_marketId].marketCreator].add((10**predictionDecimalMultiplier).mul(marketFeeParams.marketCreatorFee[_marketId]));
      emit MarketCreatorReward(marketData[_marketId].marketCreator, _marketId, marketFeeParams.marketCreatorFee[_marketId]);
      delete marketFeeParams.marketCreatorFee[_marketId];
    }
  }

  /**
  * @dev Gets price for given market and option
  * @param _marketId  Market ID
  * @param _prediction  prediction option
  * @return  option price
  **/
  function getOptionPrice(uint _marketId, uint256 _prediction) public view returns(uint64 _optionPrice) {
    require(marketData[_marketId].marketCreator != address(0));
    uint optionLen = allMarkets.getTotalOptions(_marketId);
    (uint[] memory _optionPricingParams,) = allMarkets.getMarketOptionPricingParams(_marketId,_prediction);
    PricingData storage _marketPricingData = marketData[_marketId].pricingData;
    
    // Checking if current stake in market reached minimum stake required for considering staking factor.
    if(initialPredictions.length == 0 && (_optionPricingParams[1] < _marketPricingData.stakingFactorMinStake || _optionPricingParams[0] == 0))
    {

      _optionPrice =  uint64(uint(100000).div(optionLen));

    } else {
      uint _totalStaked;
      uint _stakedOnOption;
      if(initialPredictions.length == 0) {
        _stakedOnOption = _optionPricingParams[0];
        _totalStaked = _optionPricingParams[1];
      } else {
        _stakedOnOption = initialPredictions[_prediction-1];
        _totalStaked = initialPredictions[initialPredictions.length-1];
      }
      _optionPrice = uint64(uint(100000).mul(_stakedOnOption).div(_totalStaked));
    }

    if(_optionPrice < 1000)
    {
      _optionPrice = 1000;
    }
  }
}
