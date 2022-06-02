// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IIntercoin.sol";
import "./interfaces/IIntercoinTrait.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165CheckerUpgradeable.sol";


contract IntercoinTrait is IERC165Upgradeable, IIntercoinTrait {
    using ERC165CheckerUpgradeable for address;

    address private intercoinAddr;
    bool private isSetup;
    
    /**
     * setup intercoin contract's address. happens once while initialization through factory
     * @param addr address of intercoin contract
     */
    function setIntercoinAddress(address addr) external override {
        require (addr != address(0), "Address can not be empty");
        require (isSetup == false, "Already setup");
        intercoinAddr = addr;
        isSetup = true;
    }
    
    /**
     * got stored intercoin address
     */
    function getIntercoinAddress() public override view returns (address) {
        return intercoinAddr;
    }
    
    /**
     * @param addr address of contract that need to be checked at intercoin contract
     */
    function checkInstance(address addr) internal view returns(bool) {
        requireNotEmptyIntecoinAddress();
        return IIntercoin(intercoinAddr).checkInstance(addr);
    }

    /**
     *
     */
    function _produce(address proxy) internal {
        requireNotEmptyIntecoinAddress();

        require(
            intercoinAddr.supportsInterface(type(IIntercoin).interfaceId),
            "Interface IIntercoin is not supported"
        );
        require(
            proxy.supportsInterface(type(IIntercoinTrait).interfaceId),
            "Interface IIntercoinTrait is not supported"
        );

        IIntercoin(intercoinAddr).registerInstance(proxy);
        IIntercoinTrait(proxy).setIntercoinAddress(intercoinAddr);
        
    }

    function requireNotEmptyIntecoinAddress() private view{
        require (intercoinAddr != address(0), 'Intercoin address need to be setup before');
    }

    function supportsInterface(bytes4 interfaceID) external pure returns (bool) {
        return
          interfaceID == this.supportsInterface.selector || // ERC165
          interfaceID == type(IIntercoinTrait).interfaceId
          ;
    }

}