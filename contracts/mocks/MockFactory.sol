// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IIntercoin.sol";
import "../interfaces/IIntercoinTrait.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";

import "../IntercoinTrait.sol";
import "../mocks/MockSimpleContract.sol";

contract MockFactory is OwnableUpgradeable, IntercoinTrait {
    using ClonesUpgradeable for address;

    address contractInstance;
    event InstanceCreated(address addr, uint256 instancesCount);
  
    function init(address _contractInstance) public initializer  {
        __Ownable_init();
        contractInstance = _contractInstance;
    }
    
    function produce() public payable returns(address) {
        
        address proxy = contractInstance.clone();
        
        _produce(proxy);
        
        MockSimpleContract(proxy).init();
        OwnableUpgradeable(proxy).transferOwnership(msg.sender);
        
        emit InstanceCreated(proxy, 0);
        return proxy;
    }
    
    
}
