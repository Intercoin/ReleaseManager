// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../../CostManagerFactoryHelper.sol";
import "../../ReleaseManagerHelper.sol";

import "./InstanceEx1.sol";

contract FactoryEx1 is Ownable, CostManagerFactoryHelper, ReleaseManagerHelper {
    using Clones for address;

    address public immutable implementation;
    
    address[] public instances;

    event InstanceCreated(address instance, uint256 instancesCount);
    
    constructor(
        address impl,
        address costManagerAddress,
        address releaseManagerAddress
    )
        CostManagerFactoryHelper(costManagerAddress)
        ReleaseManagerHelper(releaseManagerAddress)
    {
        implementation = impl;
    }

    function produce() public {

        address instance = address(implementation).clone();

        instances.push(instance);
        
        InstanceEx1(instance).initialize();
        Ownable(instance).transferOwnership(_msgSender());
        
        emit InstanceCreated(instance, instances.length);
        
        // register instance in release manager
        registerInstance(instance);
    }
}