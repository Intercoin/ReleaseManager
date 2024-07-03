// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ICostManager.sol";
import "./interfaces/ICostManagerFactoryHelper.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract CostManagerBase is Initializable {
    using AddressUpgradeable for address;

    address private costManager;
    address private deployer;
    bool private overrode;
    /** 
    * @dev sets the costmanager token. calling only by factory owner
    * @param costManager_ new address of costmanager token, or 0
    */
    function overrideCostManager(address costManager_) external {
        // require factory owner or operator
        // otherwise needed deployer(!!not contract owner)

        require (
            !overrode,
            "Already overrode"
        );

        require (
            deployer == _sender() && 
            ICostManagerFactoryHelper(deployer).canOverrideCostManager(address(this)),
            "cannot override"
        );
        
        overrode = true;
        _setCostManager(costManager_);
    }

    /** 
    * @dev viewer the costmanager token
    * @return address of costmanager token
    */
    function getCostManager() public view returns(address) {
        return costManager;
    }

    function __CostManagerHelper_init(address deployer_, address costManager_) internal onlyInitializing
    {
        deployer = deployer_;
        costManager = costManager_;
        overrode = false;
    }

     /**
     * @dev Private function that tells contract to account for an operation
     * @param info uint256 The operation ID (first 8 bits). in other bits any else info
     * @param param1 uint256 Some more information, if any
     * @param param2 uint256 Some more information, if any
     */
    function _accountForOperation(uint256 info, uint256 param1, uint256 param2) internal {
        if (costManager != address(0)) {
            try ICostManager(costManager).accountForOperation(
                _sender(), info, param1, param2
            )
            returns (uint256 /*spent*/, uint256 /*remaining*/) {
                // if error is not thrown, we are fine
            } catch Error(string memory reason) {
                // This is executed in case revert() was called with a reason
                revert(reason);
            } catch {
                revert("unknown error");
            }
        }
    }
    
    function _setCostManager(address costManager_) internal {
        require (
            overrode,
            "Override required by factory"
        );
        costManager = costManager_;
    }
    
    function _sender() internal virtual returns(address);
}