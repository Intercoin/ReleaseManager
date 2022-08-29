// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IReleaseManager.sol";

contract ReleaseManagerFactory is Ownable {
    using Clones for address;

    /**
    * @custom:shortd ReleaseManager implementation address
    * @notice ReleaseManager implementation address
    */
    address public immutable implementation;

    /**
    * @custom:shortd addresses's array of produced instances
    * @notice produced instances
    */
    address[] public instances;
    
    event InstanceProduced (address instance, uint256 instancesCount);

    constructor(
        address _implementation
    ) {
        implementation      = _implementation;
    }

    function produce(
    ) 
        public 
    {
        
        address instance = address(implementation).clone();

        _produce(instance);

        IReleaseManager(instance).initialize();
        Ownable(instance).transferOwnership(_msgSender());
        
    }

     ////////////////////////////////////////////////////////////////////////
    // internal section ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    function _produce(
        address instance
    ) 
        internal
    {
        require(instance != address(0), "ReleaseManagerFactory: INSTANCE_CREATION_FAILED");

        instances.push(instance);
        
        emit InstanceProduced(instance, instances.length);
    }

}

