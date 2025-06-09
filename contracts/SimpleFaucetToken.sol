// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleFaucetToken
 * @dev A simple ERC20 token with faucet functionality
 */
contract SimpleFaucetToken is ERC20, Ownable {
    
    uint256 public claimAmount = 100 * 10**18; // 100 tokens per claim
    uint256 public cooldownTime = 24 hours;    // 24 hour cooldown
    
    mapping(address => uint256) public lastClaimTime;
    
    event TokensClaimed(address indexed user, uint256 amount);
    
    constructor() ERC20("Faucet Token", "FAUCET") Ownable(msg.sender) {
        _mint(msg.sender, 1000 * 10**18); // Initial mint
    }
    
    function claim() external {
        require(canClaim(msg.sender), "Cannot claim yet - cooldown active");
        
        lastClaimTime[msg.sender] = block.timestamp;
        _mint(msg.sender, claimAmount);
        
        emit TokensClaimed(msg.sender, claimAmount);
    }
    
    function canClaim(address user) public view returns (bool) {
        return block.timestamp >= lastClaimTime[user] + cooldownTime;
    }
    
    function setClaimAmount(uint256 newAmount) external onlyOwner {
        claimAmount = newAmount;
    }
    
    function setCooldownTime(uint256 newCooldownTime) external onlyOwner {
        cooldownTime = newCooldownTime;
    }
}