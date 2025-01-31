const assertRevert = require("./utils/assertRevert.js").assertRevert;
const { assert } = require("chai");
const OwnedUpgradeabilityProxy = artifacts.require("OwnedUpgradeabilityProxy");
const Master = artifacts.require("Master");
const PlotusToken = artifacts.require("MockPLOT");
const MockchainLinkBTC = artifacts.require("MockChainLinkAggregator");
const AllMarkets = artifacts.require("MockAllMarkets");
const CyclicMarkets = artifacts.require("MockCyclicMarkets");
const CyclicMarkets_3 = artifacts.require("CyclicMarkets_3");
const OptionPricing2 = artifacts.require("OptionPricing2");
const OptionPricing3 = artifacts.require("OptionPricing3");
const increaseTime = require("./utils/increaseTime.js").increaseTime;
const increaseTimeTo = require("./utils/increaseTime.js").increaseTimeTo;
const { encode3 } = require("./utils/encoder.js");
const signAndExecuteMetaTx = require("./utils/signAndExecuteMetaTx.js").signAndExecuteMetaTx;
const { toHex, toWei, toChecksumAddress } = require("./utils/ethTools");
let privateKeyList = ["fb437e3e01939d9d4fef43138249f23dc1d0852e69b0b5d1647c087f869fabbd", "7c85a1f1da3120c941b83d71a154199ee763307683f206b98ad92c3b4e0af13e", "ecc9b35bf13bd5459350da564646d05c5664a7476fe5acdf1305440f88ed784c", "f4470c3fca4dbef1b2488d016fae25978effc586a1f83cb29ac8cb6ab5bc2d50", "141319b1a84827e1046e93741bf8a9a15a916d49684ab04925ac4ce4573eea23", "d54b606094287758dcf19064a8d91c727346aadaa9388732e73c4315b7c606f9", "49030e42ce4152e715a7ddaa10e592f8e61d00f70ef11f48546711f159d985df", "b96761b1e7ebd1e8464a78a98fe52f53ce6035c32b4b2b12307a629a551ff7cf", "d4786e2581571c863c7d12231c3afb6d4cef390c0ac9a24b243293721d28ea95", "ed28e3d3530544f1cf2b43d1956b7bd13b63c612d963a8fb37387aa1a5e11460", "05b127365cf115d4978a7997ee98f9b48f0ddc552b981c18aa2ee1b3e6df42c6", "9d11dd6843f298b01b34bd7f7e4b1037489871531d14b58199b7cba1ac0841e6", "f79e90fa4091de4fc2ec70f5bf67b24393285c112658e0d810e6bd711387fbb9", "99f1fc0f09230ce745b6a256ba7082e6e51a2907abda3d9e735a5c8188bb4ba1", "477f86cce983b9c91a36fdcd4a7ce21144a08dee9b1aafb91b9c70e57f717ce6", "b03d2e6bb4a7d71c66a66ff9e9c93549cae4b593f634a4ea2a1f79f94200f5b4", "9ddc0f53a81e631dcf39d5155f41ec12ed551b731efc3224f410667ba07b37dc", "cf087ff9ae7c9954ad8612d071e5cdf34a6024ee1ae477217639e63a802a53dd", "b64f62b94babb82cc78d3d1308631ae221552bb595202fc1d267e1c29ce7ba60", "a91e24875f8a534497459e5ccb872c4438be3130d8d74b7e1104c5f94cdcf8c2", "4f49f3d029eeeb3fed14d59625acd088b6b34f3b41c527afa09d29e4a7725c32", "179795fd7ac7e7efcba3c36d539a1e8659fb40d77d0a3fab2c25562d99793086", "4ba37d0b40b879eceaaca2802a1635f2e6d86d5c31e3ff2d2fd13e68dd2a6d3d", "6b7f5dfba9cd3108f1410b56f6a84188eee23ab48a3621b209a67eea64293394", "870c540da9fafde331a3316cee50c17ad76ddb9160b78b317bef2e6f6fc4bac0", "470b4cccaea895d8a5820aed088357e380d66b8e7510f0a1ea9b575850160241", "8a55f8942af0aec1e0df3ab328b974a7888ffd60ded48cc6862013da0f41afbc", "2e51e8409f28baf93e665df2a9d646a1bf9ac8703cbf9a6766cfdefa249d5780", "99ef1a23e95910287d39493d8d9d7d1f0b498286f2b1fdbc0b01495f10cf0958", "6652200c53a4551efe2a7541072d817562812003f9d9ef0ec17995aa232378f8", "39c6c01194df72dda97da2072335c38231ced9b39afa280452afcca901e73643", "12097e411d948f77b7b6fa4656c6573481c1b4e2864c1fca9d5b296096707c45", "cbe53bf1976aee6cec830a848c6ac132def1503cffde82ccfe5bd15e75cbaa72", "eeab5dcfff92dbabb7e285445aba47bd5135a4a3502df59ac546847aeb5a964f", "5ea8279a578027abefab9c17cef186cccf000306685e5f2ee78bdf62cae568dd", "0607767d89ad9c7686dbb01b37248290b2fa7364b2bf37d86afd51b88756fe66", "e4fd5f45c08b52dae40f4cdff45e8681e76b5af5761356c4caed4ca750dc65cd", "145b1c82caa2a6d703108444a5cf03e9cb8c3cd3f19299582a564276dbbba734", "736b22ec91ae9b4b2b15e8d8c220f6c152d4f2228f6d46c16e6a9b98b4733120", "ac776cb8b40f92cdd307b16b83e18eeb1fbaa5b5d6bd992b3fda0b4d6de8524c", "65ba30e2202fdf6f37da0f7cfe31dfb5308c9209885aaf4cef4d572fd14e2903", "54e8389455ec2252de063e83d3ce72529d674e6d2dc2070661f01d4f76b63475", "fbbbfb525dd0255ee332d51f59648265aaa20c2e9eff007765cf4d4a6940a849", "8de5e418f34d04f6ea947ce31852092a24a705862e6b810ca9f83c2d5f9cda4d", "ea6040989964f012fd3a92a3170891f5f155430b8bbfa4976cde8d11513b62d9", "14d94547b5deca767137fbd14dae73e888f3516c742fad18b83be333b38f0b88", "47f05203f6368d56158cda2e79167777fc9dcb0c671ef3aabc205a1636c26a29"];
const latestTime = require("./utils/latestTime.js").latestTime;

truncNumber = (n) => Math.trunc(n * Math.pow(10, 2)) / Math.pow(10, 2);
let masterInstance, plotusToken, MockchainLinkInstance, allMarkets;

contract("Market", async function ([user1, user2, user3, user4]) {

  before(async function () {
    masterInstance = await OwnedUpgradeabilityProxy.deployed();
    masterInstance = await Master.at(masterInstance.address);
    plotusToken = await PlotusToken.deployed();
    MockchainLinkInstance = await MockchainLinkBTC.deployed();
    allMarkets = await AllMarkets.at(await masterInstance.getLatestAddress(web3.utils.toHex("AM")));
    cyclicMarkets = await CyclicMarkets.at(await masterInstance.getLatestAddress(web3.utils.toHex("CM")));
    nullAddress = await masterInstance.getLatestAddress("0x00");

    await cyclicMarkets.setNextOptionPrice(0);

    await MockchainLinkInstance.setLatestAnswer(1195000000000);
  });

  describe("Live markets should not be affected if contract is upgraded", async () => {
    it("1.Scenario 1 - Stake < minstakes and time passed < min time passed", async () => {

      let expireT = await allMarkets.getMarketData(1);
      await increaseTime(14400 + expireT[3] / 1 - await latestTime());

      await cyclicMarkets.createMarket(0, 0, 0);
      await increaseTime(360);


      await plotusToken.transfer(user2, toWei(10000));
      await plotusToken.approve(allMarkets.address, toWei(100000), { from: user2 });
      let functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(10000), 7, plotusToken.address, 10000 * 1e8, 1);
      await signAndExecuteMetaTx(
        privateKeyList[1],
        user2,
        functionSignature,
        allMarkets,
        "AM"
      );

      await plotusToken.transfer(user3, toWei(2000));
      await plotusToken.approve(allMarkets.address, toWei(100000), { from: user3 });
      functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(2000), 7, plotusToken.address, 2000 * 1e8, 2);
      await signAndExecuteMetaTx(
        privateKeyList[2],
        user3,
        functionSignature,
        allMarkets,
        "AM"
      );

      await plotusToken.transfer(user4, toWei(5000));
      await plotusToken.approve(allMarkets.address, toWei(100000), { from: user4 });
      functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(5000), 7, plotusToken.address, 5000 * 1e8, 3);
      await signAndExecuteMetaTx(
        privateKeyList[3],
        user4,
        functionSignature,
        allMarkets,
        "AM"
      );
      let optionPrices = await cyclicMarkets.getAllOptionPrices(7);
      assert.equal(optionPrices[0] / 1, 25000);
      assert.equal(optionPrices[1] / 1, 50000);
      assert.equal(optionPrices[2] / 1, 25000);
    });

    it("Upgrade contract and Add option pricing contracts and update market type", async () => {
      let cyclicMarketsV3Impl = await CyclicMarkets_3.new();
      await masterInstance.upgradeMultipleImplementations([toHex("CM")], [cyclicMarketsV3Impl.address]);
      cyclicMarkets = await CyclicMarkets_3.at(await masterInstance.getLatestAddress(web3.utils.toHex("CM")));

      let optionPricing3 = await OptionPricing3.new();
      await cyclicMarkets.setOptionPricingContract([3], [optionPricing3.address]);
      await assertRevert(cyclicMarkets.setOptionPricingContract([3,4], [optionPricing3.address]));
      await assertRevert(cyclicMarkets.setOptionPricingContract([2], [optionPricing3.address]));
      await assertRevert(cyclicMarkets.setOptionPricingContract([1], [optionPricing3.address]));
      await assertRevert(cyclicMarkets.setOptionPricingContract([3], [nullAddress]));
      await assertRevert(cyclicMarkets.updateMarketType(0, 100, 60 * 60, 40 * 60, 120 * 1e8));
      await cyclicMarkets.alterMarketType(0, 3, 100, 8 * 60 * 60, 60 * 60, 40 * 60, 120 * 1e8);
    });

    it("Option pricing should work as expected", async () => {
      let optionPrices = await cyclicMarkets.getAllOptionPrices(7);
      assert.equal(optionPrices[0] / 1, 25000);
      assert.equal(optionPrices[1] / 1, 50000);
      assert.equal(optionPrices[2] / 1, 25000);
    });

    it("Should not allow to create when previous market is live", async () => {
      await assertRevert(cyclicMarkets.createMarket(0,0,0));
    });

    it("Creating a market will not settle previous markets", async() => {
      await increaseTime(4*60*60);
      await cyclicMarkets.createMarket(0, 0, 1);
      await increaseTime(4*60*60);
      await cyclicMarkets.createMarket(0, 0, 1);
      assert.equal((await allMarkets.marketStatus(7))/1, 1);
      await cyclicMarkets.settleMarket(7,1);
      assert.equal((await allMarkets.marketStatus(7))/1, 2);
    });

  });
});

contract("Market", async function ([user1, user2, user3, user4]) {

  before(async function () {
    masterInstance = await OwnedUpgradeabilityProxy.deployed();
    masterInstance = await Master.at(masterInstance.address);
    plotusToken = await PlotusToken.deployed();
    MockchainLinkInstance = await MockchainLinkBTC.deployed();
    allMarkets = await AllMarkets.at(await masterInstance.getLatestAddress(web3.utils.toHex("AM")));
    cyclicMarkets = await CyclicMarkets.at(await masterInstance.getLatestAddress(web3.utils.toHex("CM")));

    await cyclicMarkets.setNextOptionPrice(0);
    await MockchainLinkInstance.setLatestAnswer(1195000000000);

    let expireT = await allMarkets.getMarketData(1);
    await increaseTime(14400 + expireT[3] / 1 - await latestTime());
    await cyclicMarkets.createMarket(0, 0, 0);
    await increaseTime(360);

    let cyclicMarketsV3Impl = await CyclicMarkets_3.new();
    await masterInstance.upgradeMultipleImplementations([toHex("CM")], [cyclicMarketsV3Impl.address]);
    cyclicMarkets = await CyclicMarkets_3.at(await masterInstance.getLatestAddress(web3.utils.toHex("CM")));

  });

  describe("Contract upgraded and option pricing contracts are not set", async () => {
    it("1.Scenario 1 - Stake < minstakes and time passed < min time passed", async () => {

      await plotusToken.transfer(user2, toWei(10000));
      await plotusToken.approve(allMarkets.address, toWei(100000), { from: user2 });
      let functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(10000), 7, plotusToken.address, 10000 * 1e8, 1);
      await signAndExecuteMetaTx(
        privateKeyList[1],
        user2,
        functionSignature,
        allMarkets,
        "AM"
      );

      await plotusToken.transfer(user3, toWei(2000));
      await plotusToken.approve(allMarkets.address, toWei(100000), { from: user3 });
      functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(2000), 7, plotusToken.address, 2000 * 1e8, 2);
      await signAndExecuteMetaTx(
        privateKeyList[2],
        user3,
        functionSignature,
        allMarkets,
        "AM"
      );

      await plotusToken.transfer(user4, toWei(5000));
      await plotusToken.approve(allMarkets.address, toWei(100000), { from: user4 });
      functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(5000), 7, plotusToken.address, 5000 * 1e8, 3);
      await signAndExecuteMetaTx(
        privateKeyList[3],
        user4,
        functionSignature,
        allMarkets,
        "AM"
      );
      let optionPrices = await cyclicMarkets.getAllOptionPrices(7);
      assert.equal(optionPrices[0] / 1, 25000);
      assert.equal(optionPrices[1] / 1, 50000);
      assert.equal(optionPrices[2] / 1, 25000);
    });

    it("Add option pricing contracts and update market type", async () => {

      let optionPricing3 = await OptionPricing3.new();
      await cyclicMarkets.setOptionPricingContract([3], [optionPricing3.address]);
      await assertRevert(cyclicMarkets.alterMarketType(0, 4, 100, 8 * 60 * 60, 60 * 60, 40 * 60, 120 * 1e8));
      await assertRevert(cyclicMarkets.alterMarketType(0, 3, 0, 8 * 60 * 60, 60 * 60, 40 * 60, 120 * 1e8));
      await assertRevert(cyclicMarkets.alterMarketType(0, 3, 100, 0, 60 * 60, 40 * 60, 120 * 1e8));
      await assertRevert(cyclicMarkets.alterMarketType(0, 3, 100, 8 * 60 * 60, 0, 40 * 60, 120 * 1e8));
      await assertRevert(cyclicMarkets.alterMarketType(0, 3, 100, 8 * 60 * 60, 60 * 60, 0, 120 * 1e8));
      await assertRevert(cyclicMarkets.alterMarketType(10, 3, 100, 8 * 60 * 60, 60 * 60, 40 * 60, 120*1e8));
      await cyclicMarkets.alterMarketType(0, 3, 100, 8 * 60 * 60, 60 * 60, 40 * 60, 120 * 1e8);
    });

    it("Option pricing should work as expected", async () => {
      let optionPrices = await cyclicMarkets.getAllOptionPrices(7);
      assert.equal(optionPrices[0] / 1, 25000);
      assert.equal(optionPrices[1] / 1, 50000);
      assert.equal(optionPrices[2] / 1, 25000);
    })

  });
});

contract("3 Option market", async function ([user1, user2, user3, user4]) {

  before(async function () {
    masterInstance = await OwnedUpgradeabilityProxy.deployed();
    masterInstance = await Master.at(masterInstance.address);
    plotusToken = await PlotusToken.deployed();
    MockchainLinkInstance = await MockchainLinkBTC.deployed();
    allMarkets = await AllMarkets.at(await masterInstance.getLatestAddress(web3.utils.toHex("AM")));
    cyclicMarkets = await CyclicMarkets.at(await masterInstance.getLatestAddress(web3.utils.toHex("CM")));

    await cyclicMarkets.setNextOptionPrice(0);

    await MockchainLinkInstance.setLatestAnswer(1195000000000);

    let cyclicMarketsV3Impl = await CyclicMarkets_3.new();
    await masterInstance.upgradeMultipleImplementations([toHex("CM")], [cyclicMarketsV3Impl.address]);
    cyclicMarkets = await CyclicMarkets_3.at(await masterInstance.getLatestAddress(web3.utils.toHex("CM")));

    let optionPricing2 = await OptionPricing2.new();
    let optionPricing3 = await OptionPricing3.new();
    await cyclicMarkets.setOptionPricingContract([2, 3], [optionPricing2.address, optionPricing3.address]);
    await cyclicMarkets.alterMarketType(0, 3, 100, 8 * 60 * 60, 60 * 60, 40 * 60, 120 * 1e8);
  });

  it("1.Scenario 1 - Stake < minstakes and time passed < min time passed", async () => {

    let expireT = await allMarkets.getMarketData(1);
    await increaseTime(14400 + expireT[3] / 1 - await latestTime());

    await cyclicMarkets.createMarket(0, 0, 0);
    await increaseTime(360);


    await plotusToken.transfer(user2, toWei(10000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user2 });
    let functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(10000), 7, plotusToken.address, 10000 * 1e8, 1);
    await signAndExecuteMetaTx(
      privateKeyList[1],
      user2,
      functionSignature,
      allMarkets,
      "AM"
    );

    await plotusToken.transfer(user3, toWei(2000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user3 });
    functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(2000), 7, plotusToken.address, 2000 * 1e8, 2);
    await signAndExecuteMetaTx(
      privateKeyList[2],
      user3,
      functionSignature,
      allMarkets,
      "AM"
    );

    await plotusToken.transfer(user4, toWei(5000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user4 });
    functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(5000), 7, plotusToken.address, 5000 * 1e8, 3);
    await signAndExecuteMetaTx(
      privateKeyList[3],
      user4,
      functionSignature,
      allMarkets,
      "AM"
    );
    let optionPrices = await cyclicMarkets.getAllOptionPrices(7);
    assert.equal(optionPrices[0] / 1, 25000);
    assert.equal(optionPrices[1] / 1, 50000);
    assert.equal(optionPrices[2] / 1, 25000);
    await MockchainLinkInstance.setLatestAnswer(1);
    optionPrices = await cyclicMarkets.getAllOptionPrices(7);
    assert.equal(optionPrices[0] / 1, 50000);
    assert.equal(optionPrices[1] / 1, 33333);
    assert.equal(optionPrices[2] / 1, 16666);
    await MockchainLinkInstance.setLatestAnswer(1195000000000);
  });

  it("2.Scenario 2 - Stake > minstakes and time passed < min time passed", async () => {


    let expireT = await allMarkets.getMarketData(7);
    await increaseTime(14400 + expireT[3] / 1 - await latestTime());

    await cyclicMarkets.createMarket(0, 0, 3);



    await plotusToken.transfer(user2, toWei(10000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user2 });
    let functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(10000), 8, plotusToken.address, 10000 * 1e8, 1);
    await signAndExecuteMetaTx(
      privateKeyList[1],
      user2,
      functionSignature,
      allMarkets,
      "AM"
    );

    await plotusToken.transfer(user3, toWei(5000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user3 });
    functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(5000), 8, plotusToken.address, 5000 * 1e8, 2);
    await signAndExecuteMetaTx(
      privateKeyList[2],
      user3,
      functionSignature,
      allMarkets,
      "AM"
    );

    await plotusToken.transfer(user4, toWei(40000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user4 });
    functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(40000), 8, plotusToken.address, 40000 * 1e8, 3);
    await signAndExecuteMetaTx(
      privateKeyList[3],
      user4,
      functionSignature,
      allMarkets,
      "AM"
    );

    let expireTim = await allMarkets.getMarketData(8);
    await increaseTimeTo(expireTim[5] / 1 - 4 * 3600 + 360);

    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(8, 1)) / 1e5), 0.19);
    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(8, 2)) / 1e5), 0.16);
    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(8, 3)) / 1e5), 0.63);
  });

  it("3.Scenario 3 - Stake > minstakes and time passed > min time passed", async () => {

    let expireT = await allMarkets.getMarketData(8);

    await increaseTime(14400 + expireT[3] / 1 - await latestTime());

    await assertRevert(allMarkets.postMarketResult(7, 10000000000));

    await cyclicMarkets.createMarket(0, 0, 3);


    await plotusToken.transfer(user2, toWei(10000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user2 });
    let functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(10000), 9, plotusToken.address, 10000 * 1e8, 1);
    await signAndExecuteMetaTx(
      privateKeyList[1],
      user2,
      functionSignature,
      allMarkets,
      "AM"
    );

    await plotusToken.transfer(user3, toWei(5000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user3 });
    functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(5000), 9, plotusToken.address, 5000 * 1e8, 2);
    await signAndExecuteMetaTx(
      privateKeyList[2],
      user3,
      functionSignature,
      allMarkets,
      "AM"
    );

    await plotusToken.transfer(user4, toWei(40000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user4 });
    functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(40000), 9, plotusToken.address, 40000 * 1e8, 3);
    await signAndExecuteMetaTx(
      privateKeyList[3],
      user4,
      functionSignature,
      allMarkets,
      "AM"
    );



    let expireTim = await allMarkets.getMarketData(9);
    await increaseTimeTo(expireTim[3] / 1 - 4 * 3600 + 41 * 60);

    // let optionPricePaams = await allMarkets.getMarketOptionPricingParams(9,1);
    // await increaseTimeTo(optionPricePaams[1]/1+41*60);

    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(9, 1)) / 1e5), 0.19);
    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(9, 2)) / 1e5), 0.16);
    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(9, 3)) / 1e5), 0.63);
  });

  it("4.Scenario 4 - Stake > minstakes and time passed > min time passed max distance = 2", async () => {
    let expireT = await allMarkets.getMarketData(9);

    await increaseTime(14400 + expireT[3] / 1 - await latestTime());

    await cyclicMarkets.createMarket(0, 0, 3);

    await plotusToken.transfer(user2, toWei(10000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user2 });
    let functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(10000), 10, plotusToken.address, 10000 * 1e8, 1);
    await signAndExecuteMetaTx(
      privateKeyList[1],
      user2,
      functionSignature,
      allMarkets,
      "AM"
    );

    await plotusToken.transfer(user3, toWei(5000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user3 });
    functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(5000), 10, plotusToken.address, 5000 * 1e8, 2);
    await signAndExecuteMetaTx(
      privateKeyList[2],
      user3,
      functionSignature,
      allMarkets,
      "AM"
    );

    await plotusToken.transfer(user4, toWei(40000));
    await plotusToken.approve(allMarkets.address, toWei(100000), { from: user4 });
    functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(40000), 10, plotusToken.address, 40000 * 1e8, 3);
    await signAndExecuteMetaTx(
      privateKeyList[3],
      user4,
      functionSignature,
      allMarkets,
      "AM"
    );
    await MockchainLinkInstance.setLatestAnswer(1222000000000);
    // let optionPricePaams = await allMarkets.getMarketOptionPricingParams(10,1);
    // await increaseTimeTo(optionPricePaams[1]/1+41*60);

    let expireTim = await allMarkets.getMarketData(10);
    await increaseTimeTo(expireTim[5] / 1 - 4 * 3600 + 41 * 60);

    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(10, 1)) / 1e5), 0.17);
    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(10, 2)) / 1e5), 0.13);
    assert.equal(truncNumber((await cyclicMarkets.getOptionPrice(10, 3)) / 1e5), 0.68);
  });

});

contract("2 Option market", async function (users) {
  describe("Scenario1", async () => {
    it("0.0", async () => {
      masterInstance = await OwnedUpgradeabilityProxy.deployed();
      masterInstance = await Master.at(masterInstance.address);
      plotusToken = await PlotusToken.deployed();
      timeNow = await latestTime();

      allMarkets = await AllMarkets.at(await masterInstance.getLatestAddress(web3.utils.toHex("AM")));
      cyclicMarkets = await CyclicMarkets.at(await masterInstance.getLatestAddress(web3.utils.toHex("CM")));
      await increaseTime(5 * 3600);
      await plotusToken.transfer(users[12], toWei(100000));
      await plotusToken.transfer(users[11], toWei(100000));
      // await plotusToken.transfer(marketIncentives.address,toWei(500));

      let nullAddress = await masterInstance.getLatestAddress("0x00");

      await plotusToken.transfer(users[11], toWei(100));
      await plotusToken.approve(allMarkets.address, toWei(200000), { from: users[11] });
      await plotusToken.approve(allMarkets.address, toWei(200000));
      // await acyclicMarkets.setNextOptionPrice(18);
      // await acyclicMarkets.claimRelayerRewards();
      timeNow = await latestTime();
      let initialLiquidity = 100 * 10 ** 8;
      // await cyclicMarkets.whitelistMarketCreator(users[11]);
      await cyclicMarkets.setNextOptionPrice(0);

      await MockchainLinkInstance.setLatestAnswer(1195000000000);

      let cyclicMarketsV3Impl = await CyclicMarkets_3.new();
      await masterInstance.upgradeMultipleImplementations([toHex("CM")], [cyclicMarketsV3Impl.address]);
      cyclicMarkets = await CyclicMarkets_3.at(await masterInstance.getLatestAddress(web3.utils.toHex("CM")));

      let optionPricing2 = await OptionPricing2.new();
      let optionPricing3 = await OptionPricing3.new();
      await cyclicMarkets.setOptionPricingContract([2, 3], [optionPricing2.address, optionPricing3.address]);
      await assertRevert(cyclicMarkets.addMarketType(4 * 60 * 61, 100, Math.trunc(Date.now() / 1000), 60 * 60, 40 * 60, 100 * 1e8));
      await assertRevert(cyclicMarkets.newMarketType(2, 4 * 60 * 60, 100, Math.trunc(Date.now() / 1000), 8 * 60 * 60, 60 * 60, 40 * 60, 100 * 1e8));
      await assertRevert(cyclicMarkets.newMarketType(2, 0, 100, Math.trunc(Date.now() / 1000), 8 * 60 * 60, 60 * 60, 40 * 60, 100 * 1e8));
      await assertRevert(cyclicMarkets.newMarketType(2, 4 * 60 * 61, 0, Math.trunc(Date.now() / 1000), 8 * 60 * 60, 60 * 60, 40 * 60, 100 * 1e8));
      await assertRevert(cyclicMarkets.newMarketType(2, 4 * 60 * 61, 100, Math.trunc(Date.now() / 1000), 8 * 60 * 60, 0, 40 * 60, 100 * 1e8));
      await assertRevert(cyclicMarkets.newMarketType(2, 4 * 60 * 61, 100, Math.trunc(Date.now() / 1000), 0, 60 * 60, 40 * 60, 100 * 1e8));
      await assertRevert(cyclicMarkets.newMarketType(2, 4 * 60 * 61, 100, Math.trunc(Date.now() / 1000), 8 * 60 * 60, 60 * 60, 0, 100 * 1e8));
      await assertRevert(cyclicMarkets.newMarketType(4, 4 * 60 * 61, 100, Math.trunc(Date.now() / 1000), 8 * 60 * 60, 60 * 60, 40 * 60, 100 * 1e8));
      await cyclicMarkets.newMarketType(2, 4 * 60 * 61, 100, Math.trunc(Date.now() / 1000), 8 * 60 * 60, 60 * 60, 40 * 60, 100 * 1e8);
    });

    it("Scenario 1: Option price for Market Creator", async () => {
      timeNow = await latestTime();
      await cyclicMarkets.createMarket(0, 3, 0);
      assert.equal(await cyclicMarkets.getOptionPrice(7, 1), 50000);
      assert.equal(await cyclicMarkets.getOptionPrice(7, 2), 50000);
      // assert.equal(await allMarkets.getUserPredictionPoints(users[11],7,1),Math.floor(300*1e8/3*0.98/50000)); // post deduction stake = 98 , option price = 1/3 ~0.33333
      // assert.equal(await allMarkets.getUserPredictionPoints(users[11],7,2),Math.floor(300*1e8/3*0.98/50000)); // post deduction stake = 98 , option price = 1/3 ~0.33333
    });

    it("Scenario 2: Option price when total stake < minstake", async () => {
      let functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(9900), 7, plotusToken.address, 9900 * 1e8, 1);
      await signAndExecuteMetaTx(
        privateKeyList[0],
        users[0],
        functionSignature,
        allMarkets,
        "AM"
      );
      functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(8900), 7, plotusToken.address, 8900 * 1e8, 2);
      await signAndExecuteMetaTx(
        privateKeyList[0],
        users[0],
        functionSignature,
        allMarkets,
        "AM"
      );

      let optionPrices = await cyclicMarkets.getAllOptionPrices(7);

      assert.equal(optionPrices[0], 50000); // 1/3
      assert.equal(optionPrices[1], 50000); // 1/3
    });

    it("Scenario 3: Option price when total stake > minstake", async () => {
      await increaseTime(4 * 60 * 61);
      await cyclicMarkets.createMarket(0, 3, 0);
      let functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(9950), 8, plotusToken.address, 9950 * 1e8, 1);
      await signAndExecuteMetaTx(
        privateKeyList[0],
        users[0],
        functionSignature,
        allMarkets,
        "AM"
      );

      functionSignature = encode3("depositAndPlacePrediction(uint,uint,address,uint64,uint256)", toWei(13950), 8, plotusToken.address, 13950 * 1e8, 2);
      await signAndExecuteMetaTx(
        privateKeyList[0],
        users[0],
        functionSignature,
        allMarkets,
        "AM"
      );

      let optionPriceData1 = await allMarkets.getMarketOptionPricingParams(8, 1);
      let optionPriceData2 = await allMarkets.getMarketOptionPricingParams(8, 2);
      // assert.equal(optionPriceData1[0][1]/1, 23520*1e8);
      assert.equal(optionPriceData1[0][0] / 1, 9800 * 1e8);
      assert.equal(optionPriceData2[0][0] / 1, 13720 * 1e8);


      let optionPrices = await cyclicMarkets.getAllOptionPrices(8);

      assert.equal(optionPrices[0] / 1, 41666); // 9800/23520
      assert.equal(optionPrices[1] / 1, 58333); // 8820/23520
    });

    // it("Should revert if try to fetch option price for invalid marketId", async () => {
    // 	await assertRevert(cyclicMarkets.getAllOptionPrices(2)); // marketId 2 is cyclic market
    // });

  });
});
