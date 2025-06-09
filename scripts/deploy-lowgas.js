const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting FaucetToken deployment to Base Sepolia (Low Gas Mode)...\n");

  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Get current gas price
  const feeData = await deployer.provider.getFeeData();
  console.log("⛽ Current gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
  
  // Use lower gas price
  const lowGasPrice = ethers.parseUnits("0.05", "gwei"); // Very low gas price
  console.log("🔧 Using gas price:", ethers.formatUnits(lowGasPrice, "gwei"), "gwei");

  const network = await deployer.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  
  if (network.chainId !== 84532n) {
    throw new Error("❌ Not connected to Base Sepolia! Expected Chain ID: 84532");
  }

  console.log("\n📄 Deploying FaucetToken contract...");

  try {
    const FaucetToken = await ethers.getContractFactory("FaucetToken");
    
    // Deploy with very conservative gas settings
    const faucetToken = await FaucetToken.deploy({
      gasPrice: lowGasPrice,
      gasLimit: 2000000, // Set a reasonable gas limit
    });

    console.log("🔄 Transaction sent, waiting for confirmation...");
    console.log("📋 Transaction hash:", faucetToken.deploymentTransaction().hash);

    await faucetToken.waitForDeployment();
    
    const contractAddress = await faucetToken.getAddress();
    console.log("\n✅ FaucetToken deployed successfully!");
    console.log("📍 Contract address:", contractAddress);

    // Get contract details
    try {
      const name = await faucetToken.name();
      const symbol = await faucetToken.symbol();
      const totalSupply = await faucetToken.totalSupply();
      const claimAmount = await faucetToken.claimAmount();
      const cooldownTime = await faucetToken.cooldownTime();
      
      console.log("\n📊 Contract Details:");
      console.log("🏷️  Token name:", name);
      console.log("🎫 Token symbol:", symbol);
      console.log("📈 Total supply:", ethers.formatEther(totalSupply), symbol);
      console.log("💧 Claim amount:", ethers.formatEther(claimAmount), symbol);
      console.log("⏰ Cooldown time:", (Number(cooldownTime) / 3600).toString(), "hours");
    } catch (error) {
      console.log("⚠️  Could not fetch contract details:", error.message);
    }

    console.log("\n🎯 Next Steps:");
    console.log("1. Update your frontend .env.local with:");
    console.log(`   NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("2. Verify contract on BaseScan:");
    console.log(`   npx hardhat verify --network baseSepolia ${contractAddress}`);
    console.log("3. Test your faucet at: https://sepolia.basescan.org/address/" + contractAddress);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    
    // Calculate how much more ETH is needed
    if (error.message.includes("insufficient funds")) {
      const currentBalance = await deployer.provider.getBalance(deployer.address);
      const estimatedCost = ethers.parseEther("0.002"); // Rough estimate
      const needed = estimatedCost - currentBalance;
      
      if (needed > 0) {
        console.log(`💸 You need approximately ${ethers.formatEther(needed)} more ETH`);
        console.log("🚰 Get ETH from:");
        console.log("   • https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
        console.log("   • https://www.alchemy.com/faucets/base-sepolia");
      }
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });