const { ethers, waffle } = require('hardhat');
const { BigNumber } = require('ethers');
const { expect } = require('chai');
const chai = require('chai');
//const { time } = require('@openzeppelin/test-helpers');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

const ZERO = BigNumber.from('0');
const ONE = BigNumber.from('1');
const TWO = BigNumber.from('2');
const THREE = BigNumber.from('3');
const SIX = BigNumber.from('6');
const NINE = BigNumber.from('9');
const TEN = BigNumber.from('10');
const HUN = BigNumber.from('100');

const TENIN18 = TEN.pow(BigNumber.from('18'));

const FRACTION = BigNumber.from('100000');

chai.use(require('chai-bignumber')());

describe("itrx", function () {
    const accounts = waffle.provider.getWallets();

    const owner = accounts[0];                     
    const alice = accounts[1];
    const bob = accounts[2];
    const charlie = accounts[3];
    
    const salt          = "0x00112233445566778899AABBCCDDEEFF00000000000000000000000000000000";
    const salt2   = "0x00112233445566778899AABBCCDDEEFF00000000000000000000000000000001";

    // const tokenName = "Intercoin x";
    // const tokenSymbol = "ITRx";
    // const defaultOperators = [];
    // const initialSupply = TEN.mul(TEN.pow(SIX)).mul(TENIN18); // 10kk * 10^18
    // const maxTotalSupply = TEN.mul(TEN.pow(NINE)).mul(TENIN18); // 10kkk * 10^18

    // vars
    var releaseManagerFactory;

    beforeEach("deploying", async() => {
        let releaseManagerF = await ethers.getContractFactory("ReleaseManager");
        let releaseManagerFactoryF = await ethers.getContractFactory("ReleaseManagerFactory");
        let releaseManagerImpl = await releaseManagerF.connect(owner).deploy();
        releaseManagerFactory = await releaseManagerFactoryF.connect(owner).deploy(releaseManagerImpl.address);
    });

    it("should produce", async() => {
        let tx = await releaseManagerFactory.connect(alice).produce();

        const rc = await tx.wait(); // 0ms, as tx is already confirmed
        const event = rc.events.find(event => event.event === 'InstanceProduced');
        const [instance,] = event.args;
        console.log("instance=", instance);
        //simpleContract = await ethers.getContractAt("MockSimpleContract",instance);   
    });

    it("should produce deterministic", async() => {

        let tx = await releaseManagerFactory.connect(alice).produceDeterministic(salt);

        let rc = await tx.wait(); // 0ms, as tx is already confirmed
        let event = rc.events.find(event => event.event === 'InstanceProduced');
        let [instance,] = event.args;
        
        await expect(releaseManagerFactory.connect(alice).produceDeterministic(salt)).to.be.revertedWith('ERC1167: create2 failed');

    });

    it("can't create2 if created before with the same salt, even if different sender", async() => {
        let tx,event,instanceWithSaltAgain, instanceWithSalt, instanceWithSalt2;

        //make snapshot
        let snapId = await ethers.provider.send('evm_snapshot', []);

        tx = await releaseManagerFactory.connect(alice).produceDeterministic(salt);
        rc = await tx.wait(); // 0ms, as tx is already confirmed
        event = rc.events.find(event => event.event === 'InstanceProduced');
        [instanceWithSalt,] = event.args;
        //revert snapshot
        await ethers.provider.send('evm_revert', [snapId]);

        // make create2. then create and finally again with salt. 
        tx = await releaseManagerFactory.connect(alice).produceDeterministic(salt2);
        rc = await tx.wait(); // 0ms, as tx is already confirmed
        event = rc.events.find(event => event.event === 'InstanceProduced');
        [instanceWithSalt2,] = event.args;
        
        await releaseManagerFactory.connect(alice).produce();

        tx = await releaseManagerFactory.connect(alice).produceDeterministic(salt);
        rc = await tx.wait(); // 0ms, as tx is already confirmed
        event = rc.events.find(event => event.event === 'InstanceProduced');
        [instanceWithSaltAgain,] = event.args;


        expect(instanceWithSaltAgain).to.be.eq(instanceWithSalt);
        expect(instanceWithSalt2).not.to.be.eq(instanceWithSalt);

        await expect(releaseManagerFactory.connect(alice).produceDeterministic(salt)).to.be.revertedWith('ERC1167: create2 failed');
        await expect(releaseManagerFactory.connect(alice).produceDeterministic(salt2)).to.be.revertedWith('ERC1167: create2 failed');
        await expect(releaseManagerFactory.connect(bob).produceDeterministic(salt2)).to.be.revertedWith('ERC1167: create2 failed');
        
    });
});