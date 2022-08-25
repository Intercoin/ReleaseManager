// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IReleaseManager.sol";

contract ReleaseManager is OwnableUpgradeable, IReleaseManager {
    
    struct InstanceInfo {
        address factoryAddress;
    }

    struct FactoryInfo {
        uint8 factoryIndex; 
        uint16 releaseTag; 
        bytes24 factoryChangeNotes;
    }
    // factory that produce ReleaseManager;
    address public factory;

    mapping(address => InstanceInfo) instances;
    mapping(address => FactoryInfo) factories;

    
    modifier onlyFactory() {
        require(factories[_msgSender()].factoryIndex != 0, "FACTORY_ONLY");
        _;
    }

    /**
    * @notice initializes contract
    */
    function initialize(
    ) 
        external
        initializer 
    {
        factory = msg.sender;
        __Ownable_init();
    }

    // which will accept an array of addresses in uint256 followed by an array of struct FactoryInfo. 
    // It will save the new FactoryInfo message under the addresses. 
    // It will also fire event NewRelease with the params passed, if possible.
    function newRelease(address[] memory factoryAddresses, FactoryInfo[] memory factoryInfos) public onlyOwner 
    {
        require(factoryAddresses.length == factoryInfos.length, "INCORRECT_ARRAY_LENGTH");
        for (uint256 i = 0; i < factoryAddresses.length; i++) {
            factories[factoryAddresses[i]] = FactoryInfo(
                factoryInfos[i].factoryIndex,
                factoryInfos[i].releaseTag,
                factoryInfos[i].factoryChangeNotes
            );
        }
    }

    // which adds to instances[address] which looks for msg.sender or _msgSender() is the factory address if it supports EIP2771 just in case. 
    // It can only be called by factories in factories mapping.
    function registerInstance(address instanceAddress) external onlyFactory {
        instances[instanceAddress] = InstanceInfo(_msgSender());
    }

    
    //factory points to the factory which produced it
}

