// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./LifecycleErrors.sol";

/**
 * @title LifecyclePolicy
 * @notice Manages roles and permissions for the Asset Lifecycle system.
 * @dev Extends OpenZeppelin's AccessControl for robust RBAC.
 */
contract LifecyclePolicy is AccessControl, LifecycleErrors {
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    constructor(address _initialRegulator) {
        if (_initialRegulator == address(0)) revert InvalidAssetData();
        
        _grantRole(DEFAULT_ADMIN_ROLE, _initialRegulator);
        _grantRole(REGULATOR_ROLE, _initialRegulator);
    }

    /**
     * @notice Modifiers to enforce role-based access.
     */
    modifier onlyRegulator() {
        if (!hasRole(REGULATOR_ROLE, msg.sender)) {
            revert UnauthorizedRegulator(msg.sender);
        }
        _;
    }

    modifier onlyIssuer() {
        if (!hasRole(ISSUER_ROLE, msg.sender)) {
            revert UnauthorizedIssuer(msg.sender);
        }
        _;
    }

    /**
     * @notice Function to grant issuer role to a new address.
     * @param _issuer Address to grant issuer rights to.
     */
    function addIssuer(address _issuer) external onlyRegulator {
        grantRole(ISSUER_ROLE, _issuer);
    }

    /**
     * @notice Function to revoke issuer role.
     * @param _issuer Address to revoke issuer rights from.
     */
    function removeIssuer(address _issuer) external onlyRegulator {
        revokeRole(ISSUER_ROLE, _issuer);
    }
}
