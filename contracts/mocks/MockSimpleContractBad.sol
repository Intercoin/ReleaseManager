// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MockSimpleContractBad is OwnableUpgradeable {
    
    uint256 private val;
    event ValueChanged(uint256 from, uint256 to);
    function init() public initializer  {
        __Ownable_init();
    }
    
    function setVal(uint256 v) public{
        emit ValueChanged(val, v);
        val = v;
    }
    
    function getVal() public view returns(uint256) {
        return val;
    }
    function getValMul2() public view returns(uint256) {
        return val*2;
    }
    
}
