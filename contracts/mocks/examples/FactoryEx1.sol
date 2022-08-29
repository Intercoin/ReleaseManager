// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../../CostManagerFactoryHelper.sol";

interface InstanceEx1 {
    function initialize() external;
}

contract FactoryEx1 is Ownable, CostManagerFactoryHelper{
    using Clones for address;

    address public immutable implementation;
    
    address[] public instances;

    constructor(
        address impl
    )
        CostManagerFactoryHelper(address(0))
    {
        implementation = impl;
    }

    function produce() public {

        address instance = address(implementation).clone();

        instances.push(instance);
        
        InstanceEx1(instance).initialize();
        Ownable(instance).transferOwnership(_msgSender());
    }
}