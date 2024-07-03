const { expect } = require('chai');
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
require("@nomicfoundation/hardhat-chai-matchers");

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// const ZERO = BigNumber.from('0');
// const ONE = BigNumber.from('1');
// const TWO = BigNumber.from('2');
// const THREE = BigNumber.from('3');
// const SIX = BigNumber.from('6');
// const NINE = BigNumber.from('9');
// const TEN = BigNumber.from('10');
// const HUN = BigNumber.from('100');

// const TENIN18 = TEN.pow(BigNumber.from('18'));

// const FRACTION = 10000n;

describe("release manager", function () {
    async function deploy() {
        const accounts = await ethers.getSigners();

        const owner = accounts[0];                     
        const alice = accounts[1];
        const bob = accounts[2];
        const charlie = accounts[3];

        const salt    = "0x00112233445566778899AABBCCDDEEFF00000000000000000000000000000000";
        const salt2   = "0x00112233445566778899AABBCCDDEEFF00000000000000000000000000000001";
        let releaseManagerF = await ethers.getContractFactory("ReleaseManager");
        let releaseManagerFactoryF = await ethers.getContractFactory("ReleaseManagerFactory");
        let releaseManagerImpl = await releaseManagerF.connect(owner).deploy();

        const releaseManagerFactory = await releaseManagerFactoryF.connect(owner).deploy(releaseManagerImpl.target);

        let tx = await releaseManagerFactory.connect(alice).produce();

        const rc = await tx.wait(); // 0ms, as tx is already confirmed
        const event = rc.logs.find(obj => obj.fragment.name === 'InstanceProduced');
        const [instance,] = event.args;

        const releaseManager = await ethers.getContractAt("ReleaseManager",instance);


        const factoryEx1F = await ethers.getContractFactory("FactoryEx1");
        const instanceEx1F = await ethers.getContractFactory("InstanceEx1");


        return {
            owner,
            alice,
            bob,
            charlie,
            salt,
            salt2,
            releaseManagerFactory,
            releaseManager,
            factoryEx1F,
            instanceEx1F
        }

    }

    async function deployManagerAndRegisterFactory() {
        const res = await loadFixture(deploy);
        var {
            owner,
            alice,
            releaseManager,
            factoryEx1F,
            instanceEx1F
        } = res;

        let instanceEx1Impl = await instanceEx1F.connect(owner).deploy();
        const factoryEx1 = await factoryEx1F.connect(owner).deploy(instanceEx1Impl.target, ZERO_ADDRESS, releaseManager.target);

        // create new release
        const factoryIndex = 1;
        const releaseTag = 0x12;
        const factoryChangeNotes = "0x73696d706c65206e6f746573000000000000000000000000"; //bytes24
        await releaseManager.connect(alice).newRelease([factoryEx1.target], [[
            factoryIndex,
            releaseTag,
            factoryChangeNotes
        ]]);

        // now we can produce
        let tx = await factoryEx1.connect(owner).produce();
        const rc = await tx.wait(); // 0ms, as tx is already confirmed
        const event = rc.logs.find(obj => obj.fragment && obj.fragment.name === 'InstanceCreated');
        const [instance,] = event.args;

        const instanceEx1 = await ethers.getContractAt("InstanceEx1",instance);

        return {
            ...res,
            ...{
                factoryIndex,
                releaseTag,
                factoryChangeNotes,
                factoryEx1,
                factoryEx1F,
                instanceEx1F,
                instanceEx1
            }
        };
    }

    async function deployWithCostManager() {
        const res = await loadFixture(deployManagerAndRegisterFactory);
        var {
            owner,
            factoryEx1,
        } = res;

        const costManagerEx1F = await ethers.getContractFactory("CostManagerEx1");
        const costManagerEx1 = await costManagerEx1F.connect(owner).deploy();

        // add CustomManager
        await factoryEx1.connect(owner).setCostManager(costManagerEx1.target);

        // now we can produce
        let tx = await factoryEx1.connect(owner).produce();
        const rc = await tx.wait(); // 0ms, as tx is already confirmed
        const event = rc.logs.find(obj => obj.fragment && obj.fragment.name === 'InstanceCreated');
        const [instance,] = event.args;

        const instanceEx1WithCostManager = await ethers.getContractAt("InstanceEx1",instance);

        const info = 1;
        const param1 = 2;
        const param2 = 3;

        return {
            ...res,
            ...{
                info,
                param1,
                param2,
                costManagerEx1F,
                costManagerEx1,
                instanceEx1WithCostManager
            }
        }
    }
    
    it("cover cases when use invalid release manager address", async() => {
        const res = await loadFixture(deploy);
        var {
            owner,
            alice,
            factoryEx1F,
            instanceEx1F
        } = res;

        let instanceEx1Impl = await instanceEx1F.connect(owner).deploy();
        await expect(
            factoryEx1F.connect(owner).deploy(instanceEx1Impl.target, ZERO_ADDRESS, ZERO_ADDRESS)
        ).revertedWithCustomError(factoryEx1F, 'ReleaseManagerInvalid').withArgs(ZERO_ADDRESS);

        await expect(
            factoryEx1F.connect(owner).deploy(instanceEx1Impl.target, ZERO_ADDRESS, alice.address)
        ).revertedWithCustomError(factoryEx1F, 'ReleaseManagerInvalid').withArgs(alice.address);
    });

    it("should produce", async() => {
        const res = await loadFixture(deploy);
        const {
            alice,
            releaseManagerFactory
        } = res;

        let tx = await releaseManagerFactory.connect(alice).produce();

        const rc = await tx.wait(); // 0ms, as tx is already confirmed
        const event = rc.logs.find(obj => obj.fragment.name === 'InstanceProduced');
        const [instance,] = event.args;
        expect(instance).not.to.be.eq(ZERO_ADDRESS);
        //console.log("instance=", instance);
        //simpleContract = await ethers.getContractAt("MockSimpleContract",instance);   
    });

    it("should produce deterministic", async() => {
        const res = await loadFixture(deploy);
        const {
            alice,
            salt,
            releaseManagerFactory
        } = res;

        let tx = await releaseManagerFactory.connect(alice).produceDeterministic(salt);

        let rc = await tx.wait(); // 0ms, as tx is already confirmed
        let event = rc.logs.find(obj => obj.fragment.name === 'InstanceProduced');
        let [instance,] = event.args;
        
        await expect(releaseManagerFactory.connect(alice).produceDeterministic(salt)).to.be.revertedWith('ERC1167: create2 failed');

    });

    it("can't create2 if created before with the same salt, even if different sender", async() => {
        const res = await loadFixture(deploy);
        var {
            alice,
            salt,
            salt2,
            releaseManagerFactory
        } = res;

        let tx,event,instanceWithSaltAgain, instanceWithSalt, instanceWithSalt2;
        

        tx = await releaseManagerFactory.connect(alice).produceDeterministic(salt);
        rc = await tx.wait(); // 0ms, as tx is already confirmed
        event = rc.logs.find(obj => obj.fragment.name === 'InstanceProduced');
        [instanceWithSalt,] = event.args;
        //////////////////////////////////////////////////
        const res2 = await loadFixture(deploy);
        var {
            alice,
            bob,
            salt,
            releaseManagerFactory
        } = res2;
        // make create2. then create and finally again with salt. 
        tx = await releaseManagerFactory.connect(alice).produceDeterministic(salt2);
        rc = await tx.wait(); // 0ms, as tx is already confirmed
        event = rc.logs.find(obj => obj.fragment.name === 'InstanceProduced');
        [instanceWithSalt2,] = event.args;
        
        await releaseManagerFactory.connect(alice).produce();

        tx = await releaseManagerFactory.connect(alice).produceDeterministic(salt);
        rc = await tx.wait(); // 0ms, as tx is already confirmed
        event = rc.logs.find(obj => obj.fragment.name === 'InstanceProduced');
        [instanceWithSaltAgain,] = event.args;


        expect(instanceWithSaltAgain).to.be.eq(instanceWithSalt);
        expect(instanceWithSalt2).not.to.be.eq(instanceWithSalt);

        await expect(releaseManagerFactory.connect(alice).produceDeterministic(salt)).to.be.revertedWith('ERC1167: create2 failed');
        await expect(releaseManagerFactory.connect(alice).produceDeterministic(salt2)).to.be.revertedWith('ERC1167: create2 failed');
        await expect(releaseManagerFactory.connect(bob).produceDeterministic(salt2)).to.be.revertedWith('ERC1167: create2 failed');
        
    });

    it("validate params when call newRelease", async() => {
        const res = await loadFixture(deploy);
        var {
            owner,
            alice,
            bob,
            releaseManager,
            factoryEx1F,
            instanceEx1F
        } = res;

        let instanceEx1Impl = await instanceEx1F.connect(owner).deploy();
        const factoryEx1 = await factoryEx1F.connect(owner).deploy(instanceEx1Impl.target, ZERO_ADDRESS, releaseManager.target);

        // create new release
        const factoryIndex = 1;
        const releaseTag = 0x12;
        const factoryChangeNotes = "0x73696d706c65206e6f746573000000000000000000000000"; //bytes24

        await expect(
            releaseManager.connect(alice).newRelease([factoryEx1.target, bob.address], [[
                factoryIndex,
                releaseTag,
                factoryChangeNotes
            ]])
        ).revertedWithCustomError(releaseManager, 'IncorrectArraysLength');

        await expect(
            releaseManager.connect(alice).newRelease([], [[
                factoryIndex,
                releaseTag,
                factoryChangeNotes
            ]])
        ).revertedWithCustomError(releaseManager, 'EmptyArray');

    });

    describe("cost manager", function () {
        it("shouldnt revert instances created without CostManager, even if it was set sometime later", async() => {
            const res = await loadFixture(deployWithCostManager);
            var {
                info, 
                param1, 
                param2,
                instanceEx1,
                costManagerEx1
            } = res;
            //before imitation revert case
            await expect(instanceEx1.method1(info, param1, param2)).to.not.be.reverted;
            await costManagerEx1.doRevert(true);
            //and after imitation revert case
            await expect(instanceEx1.method1(info, param1, param2)).to.not.be.reverted;
        })

        it("should reverted instances created with CostManager when AccountOfOperation initiate revert ", async() => {

            const res = await loadFixture(deployWithCostManager);
            var {
                info, 
                param1, 
                param2,
                instanceEx1WithCostManager,
                costManagerEx1
            } = res;

            // costmanager set but no revert
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).to.not.be.reverted;
            // imitate revert case in cost manager
            await costManagerEx1.doRevert(true);
            // now method will revert;
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).revertedWith('SomeError');

        })
        it("shouldnt setup override param in CostManager directly calling `overrideCostManager`", async() => {
            const res = await loadFixture(deployWithCostManager);
            var {
                owner,
                info, 
                param1, 
                param2,
                instanceEx1WithCostManager,
                factoryEx1,
                costManagerEx1
            } = res;
            await costManagerEx1.doRevert(true);
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).revertedWith('SomeError');
            //cant override
            await expect(instanceEx1WithCostManager.overrideCostManager(ZERO_ADDRESS)).revertedWith('cannot override');
            
        });

        it("shouldnt override CostManager address twice", async() => {
            const res = await loadFixture(deployWithCostManager);
            var {
                owner,
                info, 
                param1, 
                param2,
                instanceEx1WithCostManager,
                factoryEx1,
                costManagerEx1
            } = res;
            await costManagerEx1.doRevert(true);
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).revertedWith('SomeError');

            //cant override
            await expect(instanceEx1WithCostManager.setCostManager(ZERO_ADDRESS)).revertedWith('Override required by factory');
            //renounce overrride for instanceEx1WithCostManager
            await factoryEx1.connect(owner).renounceOverrideCostManager(instanceEx1WithCostManager.target);

            await expect(
                factoryEx1.connect(owner).renounceOverrideCostManager(instanceEx1WithCostManager.target)
            ).revertedWith('Already overrode');
        });

        it("shouldnt override CostManager address until factory approve", async() => {
            const res = await loadFixture(deployWithCostManager);
            var {
                owner,
                info, 
                param1, 
                param2,
                instanceEx1WithCostManager,
                factoryEx1,
                costManagerEx1
            } = res;
            await costManagerEx1.doRevert(true);
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).revertedWith('SomeError');

            //cant override
            await expect(instanceEx1WithCostManager.setCostManager(ZERO_ADDRESS)).revertedWith('Override required by factory');
            //renounce overrride for instanceEx1WithCostManager
            await factoryEx1.connect(owner).renounceOverrideCostManager(instanceEx1WithCostManager.target);
            // now instance'sowner can override(removing) CostManager
            await instanceEx1WithCostManager.setCostManager(ZERO_ADDRESS);
            
            //now works withour reverts
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).to.not.be.reverted;
        })

        it("should override CostManager", async() => {
            const res = await loadFixture(deployWithCostManager);
            var {
                owner,
                info, 
                param1, 
                param2,
                instanceEx1WithCostManager,
                factoryEx1,
                costManagerEx1
            } = res;
            await costManagerEx1.doRevert(true);
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).revertedWith('SomeError');

            expect(await instanceEx1WithCostManager.getCostManager()).to.be.eq(costManagerEx1.target);

            // is possible to override ? - no
            expect( await factoryEx1.canOverrideCostManager(instanceEx1WithCostManager.target)).to.be.false;
            //prove it. cant override
            await expect(instanceEx1WithCostManager.setCostManager(ZERO_ADDRESS)).revertedWith('Override required by factory');
            //renounce overrride for instanceEx1WithCostManager
            await factoryEx1.connect(owner).renounceOverrideCostManager(instanceEx1WithCostManager.target);
            // override is possible
            expect( await factoryEx1.canOverrideCostManager(instanceEx1WithCostManager.target)).to.be.true;
            // now instance'sowner can override(removing) CostManager
            await instanceEx1WithCostManager.setCostManager(ZERO_ADDRESS);
            expect(await instanceEx1WithCostManager.getCostManager()).to.be.eq(ZERO_ADDRESS);
            //now works withour reverts
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).to.not.be.reverted;

        })

        it("cover cases when CostManager will return smth unexpected", async() => {
            const res = await loadFixture(deployManagerAndRegisterFactory);
            var {
                owner,
                factoryEx1,
            } = res;

            const BadCostManagerF = await ethers.getContractFactory("BadCostManager");
            const BadCostManager = await BadCostManagerF.connect(owner).deploy();

            // add CustomManager
            await factoryEx1.connect(owner).setCostManager(BadCostManager.target);

            // now we can produce
            let tx = await factoryEx1.connect(owner).produce();
            const rc = await tx.wait(); // 0ms, as tx is already confirmed
            const event = rc.logs.find(obj => obj.fragment && obj.fragment.name === 'InstanceCreated');
            const [instance,] = event.args;

            const instanceEx1WithBadCostManager = await ethers.getContractAt("InstanceEx1",instance);

            await expect(instanceEx1WithBadCostManager.method1(1, 2, 3)).revertedWith('unknown error');

        })

        
        it("should emit event `RenouncedOverrideCostManagerForInstance`", async() => {
            const res = await loadFixture(deployWithCostManager);
            var {
                owner,
                info, 
                param1, 
                param2,
                instanceEx1WithCostManager,
                factoryEx1,
                costManagerEx1
            } = res;
            await costManagerEx1.doRevert(true);
            await expect(instanceEx1WithCostManager.method1(info, param1, param2)).revertedWith('SomeError');
            await expect(
                factoryEx1.connect(owner).renounceOverrideCostManager(instanceEx1WithCostManager.target)
            ).to.emit(factoryEx1, 'RenouncedOverrideCostManagerForInstance').withArgs(instanceEx1WithCostManager.target);
            
            
        })

    }); 

    describe("release manager", function () {


        it("shouldnt produce before registering factory", async() => {
            const res = await loadFixture(deploy);
            var {
                owner,
                releaseManager,
                factoryEx1F,
                instanceEx1F
            } = res;

            let instanceEx1Impl = await instanceEx1F.connect(owner).deploy();
            let factoryEx1 = await factoryEx1F.connect(owner).deploy(instanceEx1Impl.target, ZERO_ADDRESS, releaseManager.target);
            
            await expect(factoryEx1.connect(owner).produce()).to.be.revertedWithCustomError(releaseManager, 'MakeReleaseWithFactory').withArgs(factoryEx1.target);
        });

        it("imitation", async() => {
            const res = await loadFixture(deployManagerAndRegisterFactory);
            var {
                owner,
                releaseManager,
                factoryIndex,
                releaseTag,
                factoryChangeNotes,
                factoryEx1,
                instanceEx1
            } = res;
            
            const InstanceInfo = await releaseManager.instances(instanceEx1.target);
            const FactoryInfo = await releaseManager.factories(factoryEx1.target);
            const TagInfo = await releaseManager.tags(releaseTag);
            
            //expect(InstanceInfo.factoryAddress).to.be.eq(factoryEx1.address);
            expect(InstanceInfo).to.be.eq(factoryEx1.target);
            
            expect(FactoryInfo.factoryIndex).to.be.eq(factoryIndex);
            expect(FactoryInfo.releaseTag).to.be.eq(releaseTag);
            expect(FactoryInfo.factoryChangeNotes).to.be.eq(factoryChangeNotes);
            
            expect(TagInfo.exists).to.be.eq(true);
            expect(TagInfo.finalized).to.be.eq(false);
            expect(TagInfo.list[0]).to.be.eq(factoryEx1.target);
            
        });

        it("factory(after registering) should belong to IntercoinEcosystem", async() => {
            const res = await loadFixture(deployManagerAndRegisterFactory);
            var {
                owner,
                releaseManager,
                factoryEx1
            } = res;
            expect(await releaseManager.checkFactory(factoryEx1)).to.be.true; 
            expect(await releaseManager.checkFactory(owner.address)).to.be.false; 
        }); 

        it("factory's instance should belong to IntercoinEcosystem", async() => {
            const res = await loadFixture(deployManagerAndRegisterFactory);
            var {
                owner,
                releaseManager,
                instanceEx1,
                factoryEx1
            } = res;

            expect(await releaseManager.checkInstance(instanceEx1.target)).to.be.true; 
            expect(await releaseManager.checkInstance(factoryEx1.target)).to.be.false; // factory is not an instance

        }); 
        
        it("cover notes and warnings for factory", async() => {
            const res = await loadFixture(deployManagerAndRegisterFactory);
            var {
                owner,
                alice,
                bob,
                releaseManager,
                factoryEx1
            } = res;

            const url1 = "some url #1";
            const url2 = "some url #2";
            const emptyUrl = "";

            // empty
            expect(await releaseManager.notes(factoryEx1.target)).to.be.eq(emptyUrl); 
            expect(await releaseManager.warnings(factoryEx1.target)).to.be.eq(emptyUrl); 

            // only owner can set notes or warning
            await expect(
                releaseManager.connect(bob).setNotes(factoryEx1.target, url1)
            ).revertedWith("Ownable: caller is not the owner");
            await expect(
                releaseManager.connect(bob).setWarnings(factoryEx1.target, url2)
            ).revertedWith("Ownable: caller is not the owner");

            await releaseManager.connect(alice).setNotes(factoryEx1.target, url1);
            await releaseManager.connect(alice).setWarnings(factoryEx1.target, url2);

            expect(await releaseManager.notes(factoryEx1.target)).to.be.eq(url1); 
            expect(await releaseManager.warnings(factoryEx1.target)).to.be.eq(url2); 

        }); 

        it("factory should be changeable if tag not finalized", async() => {
            const res = await loadFixture(deployManagerAndRegisterFactory);
            var {
                owner,
                alice,
                releaseManager,
                factoryIndex,
                releaseTag,
                factoryChangeNotes,
                factoryEx1,
                factoryEx1F,
                instanceEx1F
            } = res;

            let instanceEx2Impl = await instanceEx1F.connect(owner).deploy();
            let factoryEx2 = await factoryEx1F.connect(owner).deploy(instanceEx2Impl.target, ZERO_ADDRESS, releaseManager.target);

            await releaseManager.connect(alice).newRelease([factoryEx2.target], [[
                factoryIndex,
                releaseTag,
                factoryChangeNotes
            ]]);

            const TagInfo = await releaseManager.tags(releaseTag);
            //expect(TagInfo.list[0]).to.be.eq(factoryEx1.target);
            expect(TagInfo.list[1]).to.be.eq(factoryEx2.target);

            const FactoryInfo2 = await releaseManager.factories(factoryEx2.target);
            
            expect(FactoryInfo2.factoryIndex).to.be.eq(factoryIndex);
            expect(FactoryInfo2.releaseTag).to.be.eq(releaseTag);
            expect(FactoryInfo2.factoryChangeNotes).to.be.eq(factoryChangeNotes);

            // 
        }); 

        it("after relealing new factory -  old factory still able in the list", async() => {
            const res = await loadFixture(deployManagerAndRegisterFactory);
            var {
                owner,
                alice,
                releaseManager,
                factoryIndex,
                releaseTag,
                factoryChangeNotes,
                factoryEx1,
                factoryEx1F,
                instanceEx1F
            } = res;

            let instanceEx2Impl = await instanceEx1F.connect(owner).deploy();
            let factoryEx2 = await factoryEx1F.connect(owner).deploy(instanceEx2Impl.target, ZERO_ADDRESS, releaseManager.target);

            await releaseManager.connect(alice).newRelease([factoryEx2.target], [[
                factoryIndex,
                releaseTag,
                factoryChangeNotes
            ]]);

            const TagInfo = await releaseManager.tags(releaseTag);
            expect(TagInfo.list[0]).to.be.eq(factoryEx1.target);
            //expect(TagInfo.list[1]).to.be.eq(factoryEx2.target);

            const FactoryInfo1 = await releaseManager.factories(factoryEx2.target);
            
            expect(FactoryInfo1.factoryIndex).to.be.eq(factoryIndex);
            expect(FactoryInfo1.releaseTag).to.be.eq(releaseTag);
            expect(FactoryInfo1.factoryChangeNotes).to.be.eq(factoryChangeNotes);

            // 
        }); 

        it("cover finalize", async() => {
            const res = await loadFixture(deployManagerAndRegisterFactory);
            var {
                owner,
                alice,
                releaseManager,
                factoryIndex,
                releaseTag,
                factoryChangeNotes,
                factoryEx1F,
                instanceEx1F,
            } = res;


            const badReleaseTag = 0x19;

            await expect(releaseManager.connect(alice).finalizeRelease(badReleaseTag)).revertedWithCustomError(releaseManager, 'UnknownTag');
            await releaseManager.connect(alice).finalizeRelease(releaseTag);

            let instanceEx2Impl = await instanceEx1F.connect(owner).deploy();
            let factoryEx2 = await factoryEx1F.connect(owner).deploy(instanceEx2Impl.target, ZERO_ADDRESS, releaseManager.target);

            await expect(
                releaseManager.connect(alice).newRelease([factoryEx2.target], [[
                    factoryIndex,
                    releaseTag,
                    factoryChangeNotes
                ]])
            ).revertedWithCustomError(releaseManager, 'TagAlreadyFinalized').withArgs(releaseTag);


        }); 

    });
});