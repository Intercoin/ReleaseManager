// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "../interfaces/IIntercoin.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

contract SimpleContract is OwnableUpgradeSafe {
    
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
}
