const BigNumber = require('bignumber.js');
const util = require('util');
const IntercoinContract = artifacts.require("IntercoinContract");
const Factory = artifacts.require("Factory");
const SimpleContract = artifacts.require("SimpleContract");

const truffleAssert = require('truffle-assertions');
const helper = require("../helpers/truffleTestHelper");

contract('IntercoinContract', (accounts) => {
    
    // it("should assert true", async function(done) {
    //     await TestExample.deployed();
    //     assert.isTrue(true);
    //     done();
    //   });
    
    // Setup accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];  
    const accountThree = accounts[2];
    const accountFourth= accounts[3];
    const accountFive = accounts[4];
    const accountSix = accounts[5];
    const accountSeven = accounts[6];
    const accountEight = accounts[7];
    const accountNine = accounts[8];
    const accountTen = accounts[9];
    const accountEleven = accounts[10];
    const accountTwelwe = accounts[11];
    
    const zeroAddr = '0x0000000000000000000000000000000000000000';

    
    it('should create IntercointContract', async () => {
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
    });
    
    it('should produce Factory', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, {from: accountTen});
        
        var FactoryInstanceAddress;
        var FactoryInstance;
        
        await IntercoinContractInstance.getPastEvents('ProducedFactory', {
            filter: {addr: accountTen}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            FactoryInstanceAddress = events[0].args.addr;
        });
        
        FactoryInstance = await Factory.at(FactoryInstanceAddress);
        
        assert.isTrue(zeroAddr != FactoryInstanceAddress.toString(), 'Errors while creating factory');
        
    });
    
    it('checks onlyOwner methods at IntercointContract/Factory', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, {from: accountTen});
        
        var FactoryInstanceAddress;
        var FactoryInstance;
        
        await IntercoinContractInstance.getPastEvents('ProducedFactory', {
            filter: {addr: accountTen}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            FactoryInstanceAddress = events[0].args.addr;
        });
        
        FactoryInstance = await Factory.at(FactoryInstanceAddress);
        
        
        await truffleAssert.reverts(
            IntercoinContractInstance.produceFactory(SimpleContractInstance.address, { from: accountTwo }), 
            "Ownable: caller is not the owner."
        );
        
        await truffleAssert.reverts(
            IntercoinContractInstance.registerInstance(SimpleContractInstance.address, { from: accountTwo }), 
            "Intercoin: caller is not the factory"
        );
    });
    
    it('should initializer must run only onetime', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await truffleAssert.reverts(
            IntercoinContractInstance.init({ from: accountTen }), 
            "Contract instance has already been initialized"
        );
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, {from: accountTen});
        
        var FactoryInstanceAddress;
        var FactoryInstance;
        
        await IntercoinContractInstance.getPastEvents('ProducedFactory', {
            filter: {addr: accountTen}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            FactoryInstanceAddress = events[0].args.addr;
        });
        
        FactoryInstance = await Factory.at(FactoryInstanceAddress);
        
        await truffleAssert.reverts(
            FactoryInstance.init(FactoryInstanceAddress, { from: accountTen }), 
            "Contract instance has already been initialized"
        );
        
        var contractInstanceAddress;
        var contractInstance;
        
        await FactoryInstance.produce({from: accountFive});
        
        await FactoryInstance.getPastEvents('Produced', {
            filter: {addr: accountFive}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            contractInstanceAddress = events[0].args.addr;
        });
        
        contractInstance = await SimpleContract.at(contractInstanceAddress);
        
        
        await contractInstance.init({from: accountFive});
        
        await truffleAssert.reverts(
            contractInstance.init({ from: accountFive }), 
            "Contract instance has already been initialized"
        );

    });
    
    it('should produce destination contract instance', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, {from: accountTen});
        
        var FactoryInstanceAddress;
        var FactoryInstance;
        
        await IntercoinContractInstance.getPastEvents('ProducedFactory', {
            filter: {addr: accountTen}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            FactoryInstanceAddress = events[0].args.addr;
        });
        
        FactoryInstance = await Factory.at(FactoryInstanceAddress);
        
        
        var contractInstanceAddress;
        var contractInstance;
        
        await FactoryInstance.produce({from: accountFive});
        
        await FactoryInstance.getPastEvents('Produced', {
            filter: {addr: accountFive}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            contractInstanceAddress = events[0].args.addr;
        });
        
        contractInstance = await SimpleContract.at(contractInstanceAddress);
        
        await contractInstance.init({from: accountFive});
        var tmp = await contractInstance.getVal({from: accountFive});
        var owner = await contractInstance.owner({from: accountFive});
        
        assert.isTrue(owner.toString()==accountFive.toString(), 'owner is wrong');
        
    });
    
    it('should register contract instance', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, {from: accountTen});
        
        var FactoryInstanceAddress;
        var FactoryInstance;
        
        await IntercoinContractInstance.getPastEvents('ProducedFactory', {
            filter: {addr: accountTen}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            FactoryInstanceAddress = events[0].args.addr;
        });
        
        FactoryInstance = await Factory.at(FactoryInstanceAddress);
        
        
        var contractInstanceAddress;
        var contractInstance;
        
        await FactoryInstance.produce({from: accountFive});
        
        await FactoryInstance.getPastEvents('Produced', {
            filter: {addr: accountFive}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            contractInstanceAddress = events[0].args.addr;
        });
        
        contractInstance = await SimpleContract.at(contractInstanceAddress);
        
        await contractInstance.init({from: accountFive});
        
        var tmp = await IntercoinContractInstance.checkInstance(contractInstanceAddress, {from: accountThree});
        assert.isTrue(tmp, 'created contract was not registered at IntercoinContract');
        
        var tmp1 = await IntercoinContractInstance.checkInstance(accountThree, {from: accountThree});
        assert.isFalse(tmp1, 'unexpected values true at IntercoinContract::checkInstance');
    });
    
    it('check workflow if clone-contract initialized before clone (i.e. changed own storage) ', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, {from: accountTen});
        
        var FactoryInstanceAddress;
        var FactoryInstance;
        
        await IntercoinContractInstance.getPastEvents('ProducedFactory', {
            filter: {addr: accountTen}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            FactoryInstanceAddress = events[0].args.addr;
        });
        
        FactoryInstance = await Factory.at(FactoryInstanceAddress);
        
        var contractInstanceAddress;
        var contractInstance;
        
        await FactoryInstance.produce({from: accountFive});
        
        await FactoryInstance.getPastEvents('Produced', {
            filter: {addr: accountFive}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            contractInstanceAddress = events[0].args.addr;
        });
        
        contractInstance = await SimpleContract.at(contractInstanceAddress);
        
        await contractInstance.init({from: accountFive});
        await contractInstance.setVal(555, {from: accountFive});
        
        
        // #################################################################
        // #############   make clone from clone ##########################
        // #################################################################
        var IntercoinContractInstance2 = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance2.init({from: accountTen});
        
        await IntercoinContractInstance2.produceFactory(contractInstanceAddress, {from: accountTen});
        
        var FactoryInstanceAddress2;
        var FactoryInstance2;
        
        await IntercoinContractInstance2.getPastEvents('ProducedFactory', {
            filter: {addr: accountTen}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            FactoryInstanceAddress2 = events[0].args.addr;
        });
        
        FactoryInstance2 = await Factory.at(FactoryInstanceAddress2);
        
        var contractInstanceAddress2;
        var contractInstance2;
        
        await FactoryInstance2.produce({from: accountSix});
        
        await FactoryInstance2.getPastEvents('Produced', {
            filter: {addr: accountSix}, 
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ })
        .then(function(events){
            contractInstanceAddress2 = events[0].args.addr;
        });
        
        contractInstance2 = await SimpleContract.at(contractInstanceAddress2);
        await contractInstance2.init({from: accountSix});
        
        
        var tmp2 = contractInstance2.getVal({from: accountSix});
        var tmp = contractInstance.getVal({from: accountSix});
        
        assert.isTrue(tmp2!=tmp, 'storage copied !!');
    });
    
});