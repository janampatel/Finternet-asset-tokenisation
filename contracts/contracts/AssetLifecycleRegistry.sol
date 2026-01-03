// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LifecyclePolicy.sol";

/**
 * @title AssetLifecycleRegistry
 * @notice Core state machine for the Compliance-Aware Asset Lifecycle system.
 * @dev Enforces deterministic state transitions and invariants for tokenized real-world assets.
 */
contract AssetLifecycleRegistry is LifecyclePolicy {
    
    // --- Enums & Structs ---

    enum AssetState {
        REGISTERED, // 0: Initial state on registration
        VERIFIED,   // 1: Regulator has completed off-chain checks (KYC/AML)
        TOKENIZED,  // 2: Asset representation created (irreversible point)
        ACTIVE,     // 3: Trading/Transfers allowed
        FROZEN,     // 4: Compliance halt (Regulator only)
        REDEEMED    // 5: Terminal state (end of life)
    }

    enum AssetType {
        REAL_ESTATE,
        BOND,
        ART
    }

    struct Asset {
        uint256 id;
        string dataHash; // IPFS hash or similar identifier for off-chain metadata
        AssetType assetType;
        AssetState state;
        address owner; // Current owner (Issuer initially)
        uint256 registeredAt;
        uint256 updatedAt;
    }

    // --- State Variables ---

    uint256 private _currentAssetId;
    mapping(uint256 => Asset) public assets;

    // --- Events ---

    event AssetRegistered(uint256 indexed id, address indexed issuer, AssetType assetType, string dataHash);
    event AssetVerified(uint256 indexed id, address indexed regulator);
    event AssetTokenized(uint256 indexed id, address indexed issuer);
    event AssetActivated(uint256 indexed id);
    event AssetFrozen(uint256 indexed id, address indexed regulator);
    event AssetRedeemed(uint256 indexed id, address indexed issuer);

    // --- Constructor ---

    constructor(address _regulator) LifecyclePolicy(_regulator) {}

    // --- Core State Machine ---

    /**
     * @notice Register a new asset.
     * @dev Initial state: REGISTERED.
     * @param _dataHash Hash of off-chain metadata.
     * @param _assetType Type of the asset.
     */
    function registerAsset(string memory _dataHash, AssetType _assetType) external onlyIssuer returns (uint256) {
        if (bytes(_dataHash).length == 0) revert EmptyMetadata();

        _currentAssetId++;
        uint256 newId = _currentAssetId;

        assets[newId] = Asset({
            id: newId,
            dataHash: _dataHash,
            assetType: _assetType,
            state: AssetState.REGISTERED,
            owner: msg.sender,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit AssetRegistered(newId, msg.sender, _assetType, _dataHash);
        return newId;
    }

    /**
     * @notice Regulator verifies the asset.
     * @dev Transition: REGISTERED -> VERIFIED.
     */
    function verifyAsset(uint256 _id) external onlyRegulator {
        Asset storage asset = assets[_id];
        _checkState(asset, AssetState.REGISTERED);
        
        // Transition
        asset.state = AssetState.VERIFIED;
        asset.updatedAt = block.timestamp;
        
        emit AssetVerified(_id, msg.sender);
    }

    /**
     * @notice Issuer tokenizes the asset.
     * @dev Transition: VERIFIED -> TOKENIZED. Irreversible.
     */
    function tokenizeAsset(uint256 _id) external onlyIssuer {
        Asset storage asset = assets[_id];
        if (asset.owner != msg.sender) revert UnauthorizedIssuer(msg.sender);
        _checkState(asset, AssetState.VERIFIED);

        // Transition
        asset.state = AssetState.TOKENIZED;
        asset.updatedAt = block.timestamp;

        emit AssetTokenized(_id, msg.sender);
    }

    /**
     * @notice Activate asset for trading.
     * @dev Transition: TOKENIZED -> ACTIVE. Or FROZEN -> ACTIVE (if unfreezing).
     */
    function activateAsset(uint256 _id) external onlyRegulator {
        Asset storage asset = assets[_id];
        
        // Allowed from TOKENIZED or FROZEN
        if (asset.state != AssetState.TOKENIZED && asset.state != AssetState.FROZEN) {
             revert InvalidStateTransition(uint8(asset.state), uint8(AssetState.ACTIVE));
        }

        // Transition
        asset.state = AssetState.ACTIVE;
        asset.updatedAt = block.timestamp;

        emit AssetActivated(_id);
    }

    /**
     * @notice Freeze asset for compliance reasons.
     * @dev Transition: ACTIVE -> FROZEN.
     */
    function freezeAsset(uint256 _id) external onlyRegulator {
         Asset storage asset = assets[_id];
         _checkState(asset, AssetState.ACTIVE);

         // Transition
         asset.state = AssetState.FROZEN;
         asset.updatedAt = block.timestamp;

         emit AssetFrozen(_id, msg.sender);
    }

    /**
     * @notice Redeem and retire the asset.
     * @dev Transition: ACTIVE -> REDEEMED. Terminal state.
     */
    function redeemAsset(uint256 _id) external onlyIssuer {
        Asset storage asset = assets[_id];
        if (asset.owner != msg.sender) revert UnauthorizedIssuer(msg.sender);
        _checkState(asset, AssetState.ACTIVE);

        // Transition
        asset.state = AssetState.REDEEMED;
        asset.updatedAt = block.timestamp;

        emit AssetRedeemed(_id, msg.sender);
    }

    // --- Internal Helpers ---

    function _checkState(Asset storage _asset, AssetState _requiredState) internal view {
        if (_asset.id == 0) revert InvalidAssetId(0);
        if (_asset.state != _requiredState) {
            revert InvalidStateTransition(uint8(_asset.state), uint8(_requiredState)); // Logic implies we wanted to move FROM this state
        }
    }
}
