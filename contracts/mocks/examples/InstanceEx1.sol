// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../CostManagerHelper.sol";

contract InstanceEx1 is CostManagerHelper, OwnableUpgradeable {

    function initialize(address costManager_) public initializer {
        __CostManagerHelper_init(msg.sender, costManager_);
        
        __Ownable_init();
    }

    function method1(uint256 info, uint256 param1, uint256 param2) public {
        // uint256 info = 1;
        // uint256 param1 = 2; 
        // uint256 param2 = 3;
        _accountForOperation(info, param1, param2);
    }
}