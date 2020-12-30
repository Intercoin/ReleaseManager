// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

contract IntercoinTrait {
    
    address private intercoinAddr = address(0);
    bool private isSetup = false;
    
    function setIntercoinAddress(address addr) public returns(bool) {
        require (addr != address(0), 'Address can not be empty');
        require (isSetup == false, 'Already setup');
        intercoinAddr = addr;
        isSetup = true;
        
        return true;
    }
    
    function getIntercoinAddress() public view returns (address) {
        return intercoinAddr;
    }
}