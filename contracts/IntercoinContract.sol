// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";


import "./Factory.sol";
import "./interfaces/IIntercoin.sol";

contract IntercoinContract is IIntercoin, OwnableUpgradeable {
    using SafeMathUpgradeable for uint256;
    
    mapping (address => bool) factories;
    mapping (address => bool) instances;
    
    FactoriesMetaData[] internal factoriesMetaData;
    
    struct FactoriesMetaData {
        Factory addr;
        string version;
        string name;
    }
    
    Factory factoryAddr;
    event ProducedFactory(Factory addr);
    
    modifier onlyFactory() {
        require(factories[_msgSender()] == true, "Intercoin: caller is not the factory");
        _;
    }
    
    function init() public initializer  {
        __Ownable_init();
        factoryAddr = new Factory();
    }
    
    function produceFactory(address contractInstance, string memory version, string memory name) public onlyOwner returns(address factoryInstance) {
        
        Factory proxy = Factory(createClone(address(factoryAddr)));
        
        proxy.init(contractInstance);
        
        // proxy.transferOwnership(address(this));
        
        emit ProducedFactory(proxy);
        factories[address(proxy)] = true;
        FactoriesMetaData memory tmp = FactoriesMetaData(proxy,version,name);
        factoriesMetaData.push(tmp);
        
        return address(proxy);
        
    }
    
    function produce2(address factoryInstance, address adminUpgradeabilityProxy) public onlyOwner {
        Factory(factoryInstance).produceSetupOnly(adminUpgradeabilityProxy);
    } 
    
    function checkInstance(address addr) public override view returns(bool) {
        return instances[addr];
    }
    
    function viewFactoryInstances() public view returns(FactoriesMetaData[] memory) {
        return factoriesMetaData;
    }

    function registerInstance(address addr) external onlyFactory() override returns(bool) {
        instances[addr] = true;
        return true;
    }
    
    function registerFactoryInstance(address addr) internal returns(bool) {
        factories[addr] = true;
        return true;
    }
    
    function createClone(address target) internal returns (address result) {
        bytes20 targetBytes = bytes20(target);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            result := create(0, clone, 0x37)
        }
    }
    
   
    
    
}
