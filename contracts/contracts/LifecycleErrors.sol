// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LifecycleErrors
 * @notice Centralized definition of all custom errors for the Asset Lifecycle system.
 * @dev Using custom errors reduces gas costs compared to string revert messages.
 */
interface LifecycleErrors {
    // Authorization Errors
    error UnauthorizedRegister(address caller);
    error UnauthorizedRegulator(address caller);
    error UnauthorizedIssuer(address caller);
    error UnauthorizedOracle(address caller);

    // State Transition Errors
    error InvalidStateTransition(uint8 currentState, uint8 targetState);
    error AssetNotActive(uint256 assetId);
    error AssetStatusFrozen(uint256 assetId);
    error AssetStatusRedeemed(uint256 assetId);

    // Data Validation Errors
    error InvalidAssetId(uint256 assetId);
    error InvalidAssetData();
    error AssetAlreadyExists(uint256 assetId);
    error EmptyMetadata();
}
