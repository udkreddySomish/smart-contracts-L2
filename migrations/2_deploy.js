const Master = artifacts.require('Master');
const AllMarkets = artifacts.require('MockAllMarkets');
const BPLOT = artifacts.require('BPLOT');
const MockchainLink = artifacts.require('MockChainLinkAggregator');
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy');
const DisputeResolution = artifacts.require('DisputeResolution');
const CyclicMarkets = artifacts.require('MockCyclicMarkets');
const AcyclicMarkets = artifacts.require('MockAcyclicMarkets');
const EthChainlinkOracle = artifacts.require('EthChainlinkOracle');
const { assert } = require("chai");
const encode1 = require('../test/utils/encoder.js').encode1;
const BN = web3.utils.BN;

module.exports = function(deployer, network, accounts){
  deployer.then(async () => {
      
      let mockchainLinkAggregaror = await deployer.deploy(MockchainLink);
      let ethChainlinkOracle = await deployer.deploy(EthChainlinkOracle, mockchainLinkAggregaror.address);

      let bPlotToken = await deployer.deploy(BPLOT);
      let masterProxy = await deployer.deploy(Master);
      let master = await deployer.deploy(OwnedUpgradeabilityProxy, masterProxy.address);
      let allMarkets = await deployer.deploy(AllMarkets);
      let dr = await deployer.deploy(DisputeResolution);
      let cm = await deployer.deploy(CyclicMarkets);
      let ac = await deployer.deploy(AcyclicMarkets);
  });
};
