// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../interfaces/ICostManager.sol";

contract CostManagerEx1 is ICostManager {
    address public sender;
    uint256 public info;
    uint256 public param1; 
    uint256 public param2;

    uint256 public ret1;
    uint256 public ret2;

    bool b;

    function setParams(uint256 ret1_, uint256 ret2_) public {
        ret1 = ret1_;
        ret2 = ret2_;
    }

    function doRevert(bool b_) public {
        b = b_;
    }

    function accountForOperation(
        address sender_, 
        uint256 info_, 
        uint256 param1_, 
        uint256 param2_
    ) 
        external 
        returns(uint256, uint256) 
    {
        if (b) {
            revert("SomeError");
        }
        sender = sender_; 
        info = info_; 
        param1 = param1_;
        param2 = param2_;

        return (ret1, ret2);
    }
}