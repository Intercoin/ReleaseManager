// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/ICostManagerFactoryHelper.sol";
import "./CostManagerBase.sol";

// used for factory
abstract contract CostManagerFactoryHelper is ICostManagerFactoryHelper, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    address public costManager;

    EnumerableSet.AddressSet private _renouncedOverrideCostManager;

    event RenouncedOverrideCostManagerForInstance(address instance);
    
    constructor(address costManager_) {
        _setCostManager(costManager_);
    }

    /**
    * @dev set the costManager for all future calls to produce()
    */
    function setCostManager(address costManager_) public onlyOwner {
        _setCostManager(costManager_);
    }
    
    /**
    * @dev renounces ability to override cost manager on instances
    */
    function renounceOverrideCostManager(address instance) public onlyOwner {
        _renouncedOverrideCostManager.add(instance);

        CostManagerBase(instance).overrideCostManager(address(0));

        emit RenouncedOverrideCostManagerForInstance(instance);
    }
    
    /** 
    * @dev instance can call this to find out whether a given address can set the cost manager contract
    * @param instance the instance to test
    */
    function canOverrideCostManager(
        address instance
    ) 
        external 
        virtual 
        override
        view
        returns (bool) 
    {
        return (_renouncedOverrideCostManager.contains(instance));
    }

    function _setCostManager(address costManager_) internal {
        costManager = costManager_;
    }
}
