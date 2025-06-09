// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FaucetToken
 * @dev ERC20 token with built-in faucet functionality for Base Sepolia testnet
 * @author Your Name
 * 
 * Features:
 * - Standard ERC20 token with 18 decimals
 * - Built-in faucet with configurable claim amounts
 * - Cooldown period to prevent spam
 * - Owner controls for faucet parameters
 * - Pausable for emergency stops
 * - Reentrancy protection
 */
contract FaucetToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // Faucet Configuration
    uint256 public claimAmount = 100 * 10**18; // 100 tokens per claim
    uint256 public cooldownTime = 24 hours;    // 24 hour cooldown
    uint256 public maxSupply = 1000000 * 10**18; // 1M token max supply
    
    // User tracking
    mapping(address => uint256) public lastClaimTime;
    
    // Events
    event TokensClaimed(address indexed user, uint256 amount);
    event ClaimAmountUpdated(uint256 newAmount);
    event CooldownTimeUpdated(uint256 newCooldownTime);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    
    // Custom errors for gas efficiency
    error CooldownActive(uint256 timeRemaining);
    error MaxSupplyExceeded();
    error InvalidAmount();
    error InvalidCooldownTime();
    
    constructor() ERC20("Faucet Token", "FAUCET") Ownable(msg.sender) {
        // Initial mint to deployer for testing (optional)
        _mint(msg.sender, 1000 * 10**18); // 1000 tokens to deployer
    }
    
    /**
     * @dev Claim tokens from the faucet
     * @notice Users can claim tokens once per cooldown period
     */
    function claim() external nonReentrant whenNotPaused {
        address user = msg.sender;
        
        // Check if user can claim
        require(canClaim(user), "Cannot claim yet");
        
        // Check max supply
        if (totalSupply() + claimAmount > maxSupply) {
            revert MaxSupplyExceeded();
        }
        
        // Update last claim time
        lastClaimTime[user] = block.timestamp;
        
        // Mint tokens to user
        _mint(user, claimAmount);
        
        emit TokensClaimed(user, claimAmount);
    }
    
    /**
     * @dev Check if a user can claim tokens
     * @param user Address to check
     * @return bool True if user can claim
     */
    function canClaim(address user) public view returns (bool) {
        return block.timestamp >= lastClaimTime[user] + cooldownTime;
    }
    
    /**
     * @dev Get time remaining until user can claim again
     * @param user Address to check
     * @return uint256 Seconds remaining (0 if can claim now)
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        uint256 nextClaimTime = lastClaimTime[user] + cooldownTime;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }
    
    /**
     * @dev Get user's claim status information
     * @param user Address to check
     * @return canClaimNow Whether user can claim now
     * @return lastClaim Timestamp of last claim
     * @return nextClaim Timestamp when user can claim next
     */
    function getClaimStatus(address user) external view returns (
        bool canClaimNow,
        uint256 lastClaim,
        uint256 nextClaim
    ) {
        lastClaim = lastClaimTime[user];
        nextClaim = lastClaim + cooldownTime;
        canClaimNow = block.timestamp >= nextClaim;
    }
    
    // Owner functions for faucet management
    
    /**
     * @dev Update the amount of tokens claimable per request
     * @param newAmount New claim amount in wei (18 decimals)
     */
    function setClaimAmount(uint256 newAmount) external onlyOwner {
        if (newAmount == 0) revert InvalidAmount();
        claimAmount = newAmount;
        emit ClaimAmountUpdated(newAmount);
    }
    
    /**
     * @dev Update the cooldown time between claims
     * @param newCooldownTime New cooldown time in seconds
     */
    function setCooldownTime(uint256 newCooldownTime) external onlyOwner {
        if (newCooldownTime < 1 hours || newCooldownTime > 7 days) {
            revert InvalidCooldownTime();
        }
        cooldownTime = newCooldownTime;
        emit CooldownTimeUpdated(newCooldownTime);
    }
    
    /**
     * @dev Update the maximum supply of tokens
     * @param newMaxSupply New maximum supply
     */
    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= totalSupply(), "Max supply cannot be less than current supply");
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }
    
    /**
     * @dev Emergency mint function for contract owner
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Pause the faucet functionality
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the faucet functionality
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get comprehensive faucet information
     * @return _claimAmount Current claim amount
     * @return _cooldownTime Current cooldown time
     * @return _maxSupply Maximum token supply
     * @return _totalSupply Current total supply
     * @return _isPaused Whether the contract is paused
     */
    function getFaucetInfo() external view returns (
        uint256 _claimAmount,
        uint256 _cooldownTime,
        uint256 _maxSupply,
        uint256 _totalSupply,
        bool _isPaused
    ) {
        return (claimAmount, cooldownTime, maxSupply, totalSupply(), paused());
    }
}