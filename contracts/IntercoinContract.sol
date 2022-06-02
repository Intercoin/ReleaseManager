// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import "./interfaces/IIntercoin.sol";
import "./interfaces/IIntercoinTrait.sol";


contract IntercoinContract is IIntercoin, Ownable, IERC165 {
    using Counters for Counters.Counter;
    
    struct FactoriesMetaData {
        string version;
        string name;
        bool exists;
    }

    struct InstancesMetaData {
        bool exists;
    }
    
    Counters.Counter factoriesCounter;
    Counters.Counter instancesCounter;
    mapping (address => uint256) factoriesIds;
    mapping (address => uint256) instancesIds;
    
    mapping (uint256 => FactoriesMetaData) factories;
    mapping (uint256 => InstancesMetaData) instances;

    FactoriesMetaData[] internal factoriesMetaData;
    
    event RegisteredFactory(address factory);
    event RegisteredInstance(address instance);
    
    modifier onlyFactory() {
        require(factoriesIds[_msgSender()] != 0, "Intercoin: caller is not the factory");
        _;
    }

    
    function registerFactory(
        address factoryAddress, 
        string memory version, 
        string memory name
    ) 
        public 
        onlyOwner 
    {

        factoriesCounter.increment();
        
        factoriesIds[factoryAddress] = factoriesCounter.current();

        FactoriesMetaData memory tmp = FactoriesMetaData(version, name, true);
        factories[factoriesCounter.current()] = tmp;

        IIntercoinTrait(factoryAddress).setIntercoinAddress(address(this));

        emit RegisteredFactory(factoryAddress);

        
    }
    
    function checkInstance(address addr) public override view returns(bool) {
        return (instancesIds[addr] != 0);
    }
    
    function viewFactoryInstances() public view returns(FactoriesMetaData[] memory) {
        FactoriesMetaData[] memory ret = new FactoriesMetaData[](factoriesCounter.current());
        for (uint256 i = 1; i<= factoriesCounter.current(); i++) {
            ret[i-1] = FactoriesMetaData(
                factories[i].version, 
                factories[i].name, 
                factories[i].exists
            );
        }
        return ret;
    }

    function registerInstance(address instance) external onlyFactory() {
        
        require(instancesIds[instance] == 0, "Intercoin: instance already registered");
        instancesCounter.increment();
        
        instancesIds[instance] = instancesCounter.current();

        InstancesMetaData memory tmp = InstancesMetaData(true);
        instances[instancesCounter.current()] = tmp;

        emit RegisteredInstance(instance);
        
    }

    function supportsInterface(bytes4 interfaceID) external pure returns (bool) {
        return
          interfaceID == this.supportsInterface.selector || // ERC165
          interfaceID == type(IIntercoin).interfaceId
          ;
    }
    
}
