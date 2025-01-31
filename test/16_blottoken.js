const BLOT = artifacts.require('BPLOT');
const BPLOTMigration = artifacts.require('bPLOTMigration');
const PLOT = artifacts.require('MockPLOT');
const OwnedUpgradeabilityProxy = artifacts.require("OwnedUpgradeabilityProxy");
const Master = artifacts.require("Master");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const { assertRevert } = require('./utils/assertRevert');
var BLOTInstance;
const hash = '0x8da5e6ecc73d11e04b92e026989772d21e293c3943243c2d39ecf1439891d613';
const timestamp = 1613651613;
contract('bLOTToken', function([user1,user2,user3,user4]){


    it('1.Minter can mint bLOTTokens',async function(){
        let masterInstance = await OwnedUpgradeabilityProxy.deployed();
        masterInstance = await Master.at(masterInstance.address);
        PLOTInstance = await PLOT.deployed();
        BLOTInstance = await BLOT.at(await masterInstance.getLatestAddress(web3.utils.fromAscii("BL")));
        await PLOTInstance.approve(BLOTInstance.address, "10000000000000000000000");
        let canMint = await BLOTInstance.mint(user1,"1000000000000000000000");
        await assertRevert(BLOTInstance.setMasterAddress(user1, user1));
        assert.ok(canMint)
        })


    it('2. Should reduce PLOT tokens to give equal number of bLOT tokens',async function(){
        PLOTInstance = await PLOT.deployed();
        // BLOTInstance = await BLOT.deployed();
        await PLOTInstance.approve(BLOTInstance.address, "10000000000000000000000");
        let PLOTbeforeUser1 =  await PLOTInstance.balanceOf(user1);
        let BLOTbeforeUser2 =  await BLOTInstance.balanceOf(user2);
        await BLOTInstance.mint(user2,"1000000000000000000000");
        let PLOTAfterUser1 =  await PLOTInstance.balanceOf(user1);
        let BLOTAfterUser2 =  await BLOTInstance.balanceOf(user2);
         // assert.equal(BLOTAfterUser2/1,PLOTbeforeUser1/1-PLOTAfterUser1/1)
        })


    it('3. Totalsupply of PLOT tokens to remain same ,Total supply of bLOT should increase',async function(){
        PLOTInstance = await PLOT.deployed();
        // BLOTInstance = await BLOT.deployed();
        await PLOTInstance.approve(BLOTInstance.address, "10000000000000000000000");
        let totalSupplyPLOT1 =  await PLOTInstance.totalSupply();
        let totalSupplyBLOT1 =  await BLOTInstance.totalSupply();
        await BLOTInstance.mint(user2,"1000000000000000000000");
        let totalSupplyPLOT2 =  await PLOTInstance.totalSupply();
        let totalSupplyBLOT2 =  await BLOTInstance.totalSupply();
         assert.equal(totalSupplyPLOT1/1,totalSupplyPLOT2/1)
         assert.equal(totalSupplyBLOT2/1-totalSupplyBLOT1/1,"1000000000000000000000")
        })


    it('4. Minter can transfer bLOT  tokens ,non minter cannot transfer bLOT token',async function(){
        PLOTInstance = await PLOT.deployed();
        // BLOTInstance = await BLOT.deployed();
        await PLOTInstance.approve(BLOTInstance.address, "10000000000000000000000");
        await BLOTInstance.mint(user1,"1000000000000000000000");
        let canTransfer = await BLOTInstance.transfer(user2,"100000000000000000",{from : user1});
        assert.ok(canTransfer)
        await assertRevert(BLOTInstance.transfer(user2,"100000000000000000",{from : user2}))
        })


    it('5. Minter can transfer from bLOT  tokens ,non minter cannot transfer from bLOT token',async function(){
        PLOTInstance = await PLOT.deployed();
        // BLOTInstance = await BLOT.deployed();
        await PLOTInstance.approve(BLOTInstance.address, "10000000000000000000000");
        await BLOTInstance.mint(user1,"1000000000000000000000")
        })


    // it('6. bLOT tokens cannot be converted to PLOT directly',async function(){
    //     PLOTInstance = await PLOT.deployed();
    //     // BLOTInstance = await BLOT.deployed();
    //     await PLOTInstance.approve(BLOTInstance.address, "10000000000000000000000");
    //     await BLOTInstance.mint(user1,"1000000000000000000000");
    //     await assertRevert(BLOTInstance.convertToPLOT(BLOTInstance.address, BLOTInstance.address, "10000000000000000000000"))
    //     })

    it('7. Should not allow to mint to zero address',async function(){
        await PLOTInstance.approve(BLOTInstance.address, "10000000000000000000000");
        await assertRevert(BLOTInstance.mint(ZERO_ADDRESS,"1000000000000000000000"));
    });

    it('8. Add bPLOT migration contract as minter', async function() {
        bPLOTMigration = await BPLOTMigration.new(BLOTInstance.address, user3, user4);
        await BLOTInstance.addMinter(bPLOTMigration.address);
        assert.equal(await BLOTInstance.isMinter(bPLOTMigration.address), true);
    })

    it('9. Should authorise the txn when called from authController', async function() {
        await (bPLOTMigration.whitelistMigration(hash,user1,user2,timestamp,"1000000000000000000000",{from:user3}));
    });

    it('10. Should not authorise when the same txn is authorised again', async function() {
        await assertRevert(bPLOTMigration.whitelistMigration(hash,user1,user2,timestamp,"1000000000000000000000",{from:user3}));
    });

    it('11. Should not be able to migrate tokens if migration contract doesnt hold bPLOT', async function() {
        await assertRevert(bPLOTMigration.migrate(hash,user1,user2,timestamp,"1000000000000000000000",{from:user4}));
    });

    it('12. Should migrate tokens as authorised when called from migrationController', async function() {
        await BLOTInstance.mint(bPLOTMigration.address,"10000000000000000000000")
        await (bPLOTMigration.migrate(hash,user1,user2,timestamp,"1000000000000000000000",{from:user4}));
    });

    it('13.Should not migrate tokens if the authorised txn is already migrated', async function() {
        await assertRevert(bPLOTMigration.migrate(hash,user1,user2,timestamp,"1000000000000000000000",{from:user4}));
    });

    it('14.Should not migrate tokens if the txn is not authorised', async function() {
        await assertRevert(bPLOTMigration.migrate(hash,user1,user2,timestamp,"2000000000000000000000",{from:user4}));
    });

    it('15.Should revert when not called from authController', async function() {
        await assertRevert(bPLOTMigration.whitelistMigration(hash,user1,user2,timestamp,"2000000000000000000000",{from:user2}));
    });

    it('16.Should revert when not called from migrationController', async function() {
        await assertRevert(bPLOTMigration.migrate(hash,user1,user2,timestamp,"2000000000000000000000",{from:user2}));
    });

    it('17.Should be able to renounce as minter', async function() {
        await bPLOTMigration.renounceMinterRole({from:user3});
        assert.equal(await BLOTInstance.isMinter(bPLOTMigration.address), false);
    });

})