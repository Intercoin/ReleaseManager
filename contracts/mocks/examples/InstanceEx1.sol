// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;


import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../../CostManagerHelper.sol";

contract InstanceEx1 is CostManagerHelper, OwnableUpgradeable {
   

    function initialize() public initializer {
        __CostManagerHelper_init(msg.sender);
        __Ownable_init();
    }
}