const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting FaucetToken deployment to Base Sepolia...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH\n");

  if (balance < ethers.parseEther("0.01")) {
    console.log("Warning: Low ETH balance. You might need more ETH for deployment and gas fees.");
    console.log("Get Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet\n");
  }

  // Deploy the contract
  console.log("🔨 Deploying FaucetToken contract...");
  const FaucetToken = await ethers.getContractFactory("FaucetToken");
  
  const faucetToken = await FaucetToken.deploy();
  await faucetToken.waitForDeployment();
  
  const contractAddress = await faucetToken.getAddress();
  console.log("FaucetToken deployed to:", contractAddress);

  // Get initial contract state
  const name = await faucetToken.name();
  const symbol = await faucetToken.symbol();
  const decimals = await faucetToken.decimals();
  const claimAmount = await faucetToken.claimAmount();
  const cooldownTime = await faucetToken.cooldownTime();
  const maxSupply = await faucetToken.maxSupply();
  const deployerBalance = await faucetToken.balanceOf(deployer.address);

  console.log("\n Contract Information:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals);
  console.log("   Claim Amount:", ethers.formatEther(claimAmount), symbol);
  console.log("   Cooldown Time:", Number(cooldownTime) / 3600, "hours");
  console.log("   Max Supply:", ethers.formatEther(maxSupply), symbol);
  console.log("   Deployer Balance:", ethers.formatEther(deployerBalance), symbol);

  console.log("\n Important Links:");
  console.log("   Contract:", `https://sepolia.basescan.org/address/${contractAddress}`);
  console.log("   Deployer:", `https://sepolia.basescan.org/address/${deployer.address}`);

  console.log("\n Next Steps:");
  console.log("1. Verify the contract on BaseScan:");
  console.log(`   npx hardhat verify --network baseSepolia ${contractAddress}`);
  console.log("\n2. Update your .env.local file:");
  console.log(`   NEXT_PUBLIC_FAUCET_TOKEN_ADDRESS=${contractAddress}`);
  console.log("\n3. Test the faucet in your frontend!");

  // Save deployment info to file
  const deploymentInfo = {
    network: "baseSepolia",
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    tokenInfo: {
      name,
      symbol,
      decimals: Number(decimals),
      claimAmount: ethers.formatEther(claimAmount),
      cooldownTime: Number(cooldownTime),
      maxSupply: ethers.formatEther(maxSupply),
    },
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });