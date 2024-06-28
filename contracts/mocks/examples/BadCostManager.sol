// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../interfaces/ICostManager.sol";

contract BadCostManager is ICostManager {
    uint256 constant ret1 = 1;
    uint256 constant ret2 = 2;
    uint256 ret3;
    function accountForOperation(
        address, 
        uint256, 
        uint256, 
        uint256 
    ) 
        external 
        returns(uint256, uint256) 
    {
        ret3 = 3;
        revert();
//        return (ret1, ret2);
    }
}