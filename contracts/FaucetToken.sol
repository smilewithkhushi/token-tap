// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
    
    function canClaim(address user) public view returns (bool) {
        return block.timestamp >= lastClaimTime[user] + cooldownTime;
    }

    //keeping users wait because why not - kp
    function timeUntilNextClaim(address user) external view returns (uint256) {
        uint256 nextClaimTime = lastClaimTime[user] + cooldownTime;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }
    
    function getClaimStatus(address user) external view returns (
        bool canClaimNow,
        uint256 lastClaim,
        uint256 nextClaim
    ) {
        lastClaim = lastClaimTime[user];
        nextClaim = lastClaim + cooldownTime;
        canClaimNow = block.timestamp >= nextClaim;
    }
    
    
    function setClaimAmount(uint256 newAmount) external onlyOwner {
        if (newAmount == 0) revert InvalidAmount();
        claimAmount = newAmount;
        emit ClaimAmountUpdated(newAmount);
    }

    function setCooldownTime(uint256 newCooldownTime) external onlyOwner {
        if (newCooldownTime < 1 hours || newCooldownTime > 7 days) {
            revert InvalidCooldownTime();
        }
        cooldownTime = newCooldownTime;
        emit CooldownTimeUpdated(newCooldownTime);
    }
    
   
    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply >= totalSupply(), "Max supply cannot be less than current supply");
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }
    
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Would exceed max supply");
        _mint(to, amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
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