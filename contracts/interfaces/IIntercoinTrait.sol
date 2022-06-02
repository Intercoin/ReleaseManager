// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IIntercoinTrait {
    
    function setIntercoinAddress(address addr) external;
    function getIntercoinAddress() external view returns (address);
    
}