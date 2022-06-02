const { ethers, waffle } = require('hardhat');
const { BigNumber } = require('ethers');
const { expect } = require('chai');
const chai = require('chai');
const { time } = require('@openzeppelin/test-helpers');

const ZERO = BigNumber.from('0');
const ONE = BigNumber.from('1');
const TWO = BigNumber.from('2');
const THREE = BigNumber.from('3');
const FOUR = BigNumber.from('4');
const FIVE = BigNumber.from('5');
const SIX = BigNumber.from('6');
const SEVEN = BigNumber.from('7');
const NINE = BigNumber.from('9');
const TEN = BigNumber.from('10');
const ELEVEN = BigNumber.from('11');
const HUNDRED = BigNumber.from('100');
const THOUSAND = BigNumber.from('1000');
const MILLION = BigNumber.from('1000000');


const ONE_ETH = ethers.utils.parseEther('1');

//const TOTALSUPPLY = ethers.utils.parseEther('1000000000');    
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

const version = '0.1';
const name = 'SomeContractName';

describe("ContestETHOnly", function () {
    const accounts = waffle.provider.getWallets();
    
    // Setup accounts.
    const owner = accounts[0];                     
    const accountOne = accounts[1];  
    const accountTwo = accounts[2];
    const accountThree= accounts[3];
    const accountFourth = accounts[4];
    const accountFive = accounts[5];
    const accountSix = accounts[6];
    const accountSeven = accounts[7];
    const accountEight = accounts[8];
    const accountNine = accounts[9];
    const accountTen = accounts[10];
    const accountEleven = accounts[11];
    const accountTwelwe = accounts[12];
    
    // setup useful vars
    
    var IntercoinContractF;
    var MockFactoryF;
    var MockSimpleContractF;
    var MockSimpleContractBadF;
    
    var snapId;
    
    var intercoinContract;
        var factory;
        var simpleContract;

    beforeEach("deploying", async() => {

        // make snapshot before time manipulations
        // snapId = await ethers.provider.send('evm_snapshot', []);

        IntercoinContractF = await ethers.getContractFactory("IntercoinContract");
        MockFactoryF = await ethers.getContractFactory("MockFactory");
        MockFactoryBadF = await ethers.getContractFactory("MockFactoryBad");
        MockSimpleContractF = await ethers.getContractFactory("MockSimpleContract");
        MockSimpleContractBadF = await ethers.getContractFactory("MockSimpleContractBad");
           
        intercoinContract = await IntercoinContractF.connect(owner).deploy();
        //console.log(`beforeEach("deploying"`);
    });

    
    afterEach("deploying", async() => { 
        // restore snapshot
        // await ethers.provider.send('evm_revert', [snapId]);
        
    });

    
    
    it('test', async () => {

        let mockFactory = await MockFactoryF.connect(owner).deploy();

        let mockSimpleContractImpl = await MockSimpleContractF.connect(owner).deploy();

        await mockFactory.connect(owner).init(mockSimpleContractImpl.address);

        await intercoinContract.registerFactory(mockFactory.address, version, name);

        let tx = await mockFactory.connect(accountOne).produce();

        const rc = await tx.wait(); // 0ms, as tx is already confirmed
        const event = rc.events.find(event => event.event === 'InstanceCreated');
        const [instance,] = event.args;

        simpleContract = await ethers.getContractAt("MockSimpleContract",instance);   

        await expect(simpleContract.setIntercoinAddress(ZERO_ADDRESS)).to.be.revertedWith("Address can not be empty");
        await expect(simpleContract.setIntercoinAddress(accountTwo.address)).to.be.revertedWith("Already setup");

await expect(intercoinContract.connect(accountTwo).registerInstance(accountTwo.address)).to.be.revertedWith("Intercoin: caller is not the factory");
        

        expect(await simpleContract.getSelfAddrRegisterAtIntercoin()).to.be.eq(true);
        expect(await intercoinContract.checkInstance(simpleContract.address)).to.be.eq(true);

        let factoriesInstances = await intercoinContract.viewFactoryInstances();
        expect(factoriesInstances[0].version).to.be.eq(version);
        expect(factoriesInstances[0].name).to.be.eq(name);
        expect(factoriesInstances[0].exists).to.be.eq(true);

/**/

    });
    describe("unexpected errors", function (){

        it('when using bad instances', async () => {
            
            let mockFactory = await MockFactoryF.connect(owner).deploy();

            let mockSimpleContractBadImpl = await MockSimpleContractBadF.connect(owner).deploy();

            await mockFactory.connect(owner).init(mockSimpleContractBadImpl.address);

            await intercoinContract.registerFactory(mockFactory.address, version, name);

            
            await expect(
                mockFactory.connect(accountOne).produce()
            ).to.be.revertedWith("Interface IIntercoinTrait is not supported");

        });

        it('when using bad factory', async () => {
            
            let mockFactoryBad = await MockFactoryBadF.connect(owner).deploy();

            let mockSimpleContractImpl = await MockSimpleContractF.connect(owner).deploy();

            await mockFactoryBad.connect(owner).init(mockSimpleContractImpl.address);

            await intercoinContract.registerFactory(mockFactoryBad.address, version, name);

            
            await expect(
                mockFactoryBad.connect(accountOne).produce()
            ).to.be.revertedWith("Intercoin: instance already registered");

        });
    
    });
}); 

/*
    


  
    
    it('checks onlyOwner methods at IntercoinContract/Factory', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, version, name, {from: accountTen});
        
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
            IntercoinContractInstance.produceFactory(SimpleContractInstance.address, version, name, { from: accountTwo }), 
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
            //"Contract instance has already been initialized"
            "Initializable: contract is already initialized"
        );
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, version, name, {from: accountTen});
        
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
            //"Contract instance has already been initialized"
            "Initializable: contract is already initialized"
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
            //"Contract instance has already been initialized"
            "Initializable: contract is already initialized"
        );

    });
    
    it('should produce destination contract instance', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, version, name, {from: accountTen});
        
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
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, version, name, {from: accountTen});
        
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
        
        var tmp2 = await contractInstance.getIntercoinAddress({from: accountThree});
        assert.equal(IntercoinContractInstance.address, tmp2, 'intercoinAddress does not equal with value stored at contract instance')
        
    });
    
    it('check workflow if clone-contract initialized before clone (i.e. changed own storage) ', async () => {
        var SimpleContractInstance = await SimpleContract.new({from: accountTen});
        
        var IntercoinContractInstance = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance.init({from: accountTen});
        
        await IntercoinContractInstance.produceFactory(SimpleContractInstance.address, version, name, {from: accountTen});
        
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
        
        
        //  verify contract created by our factory 
        var varShouldBeTrue = await contractInstance.getSelfAddrRegisterAtIntercoin();
        //console.log('varShouldBeTrue=', varShouldBeTrue);     
        assert.isTrue(varShouldBeTrue, 'created contract was not registered at IntercoinContract');
        
        // even if we try to create contract and setup internal intercoin address var manually 
        var regularSimpleContractInstance = await SimpleContract.new({from: accountTen});
        await regularSimpleContractInstance.init({from: accountFive});
        await truffleAssert.reverts(
            regularSimpleContractInstance.getSelfAddrRegisterAtIntercoin(), 
            "Intercoin address need to be setup before"
        );
        await regularSimpleContractInstance.setIntercoinAddress(IntercoinContractInstance.address, {from: accountFive});
        var varShouldBeFalse = await regularSimpleContractInstance.getSelfAddrRegisterAtIntercoin({from: accountFive});
        //console.log('varShouldBeFalse=', varShouldBeFalse);
        assert.isFalse(varShouldBeFalse, 'created contract should not to be registered at IntercoinContract');
        
        
        // #################################################################
        // #############   make clone from clone ##########################
        // #################################################################
        var IntercoinContractInstance2 = await IntercoinContract.new({from: accountTen});
        await IntercoinContractInstance2.init({from: accountTen});
        
        await IntercoinContractInstance2.produceFactory(contractInstanceAddress, version, name, {from: accountTen});
        
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
        
        let tmp3 = await IntercoinContractInstance2.viewFactoryInstances();
        
        assert.equal(
            tmp3[0].addr, 
            FactoryInstance2.address, 
            'method `viewFactoryInstances` return wrong information (`addr`)'
        );
        
        assert.equal(
            tmp3[0].version,
            version,
            'method `viewFactoryInstances` return wrong information (`version`)'
        );
        assert.equal(
            tmp3[0].name,
            name,
            'method `viewFactoryInstances` return wrong information (`name`)'
        );
        
    });
    
});
*/