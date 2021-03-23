// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "./interfaces/IIntercoin.sol";
import "./interfaces/IIntercoinTrait.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Factory is OwnableUpgradeable {
    address contractInstance;
    event Produced(address caller, address addr);
  
    function init(address _contractInstance) public initializer  {
        __Ownable_init();
        contractInstance = _contractInstance;
    }
    
    function produce() public payable returns(address) {
        
        address proxy = createClone(address(contractInstance));
        
        bool success =  IIntercoin(owner()).registerInstance(proxy);
        require(success == true, 'Can not register instance');
        
        bool success2 = IIntercoinTrait(proxy).setIntercoinAddress(owner());
        require(success2 == true, 'Can not setup intercoin address');
        
        emit Produced(msg.sender, proxy);
        return proxy;
    }
    
    
    function produceSetupOnly(address proxy) external payable onlyOwner returns(address) {
        //constructor(address _logic, address _admin, bytes memory _data) UpgradeabilityProxy(_logic, _data) public payable {
        //address proxy = new AdminUpgradeabilityProxy(address(contractInstance), address(adminProxy), bytes(''));
        
        bool success =  IIntercoin(owner()).registerInstance(proxy);
        require(success == true, 'Can not register instance');
        
        bool success2 = IIntercoinTrait(proxy).setIntercoinAddress(owner());
        require(success2 == true, 'Can not setup intercoin address');
        
        emit Produced(msg.sender, proxy);
        return proxy;
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
