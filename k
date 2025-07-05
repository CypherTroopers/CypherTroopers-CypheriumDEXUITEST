const { ethers } = require("ethers");

// 設定
const RPC_URL = "https://make-cph-great-again.community";
const PRIVATE_KEY = "80829c0056febd5df8ea7cecf10aa3ffded0127c695a410a03b20b5202e99937";

const managerAddress = "0x96c8c289fd5a8de8a7d8bfddd6066b7cdc2d07a7";

const abi = [
  // mint
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "token0", "type": "address" },
          { "internalType": "address", "name": "token1", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "int24", "name": "tickLower", "type": "int24" },
          { "internalType": "int24", "name": "tickUpper", "type": "int24" },
          { "internalType": "uint256", "name": "amount0Desired", "type": "uint256" },
          { "internalType": "uint256", "name": "amount1Desired", "type": "uint256" },
          { "internalType": "uint256", "name": "amount0Min", "type": "uint256" },
          { "internalType": "uint256", "name": "amount1Min", "type": "uint256" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct INonfungiblePositionManager.MintParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "mint",
    "outputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint128", "name": "liquidity", "type": "uint128" },
      { "internalType": "uint256", "name": "amount0", "type": "uint256" },
      { "internalType": "uint256", "name": "amount1", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  // positions
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "positions",
    "outputs": [
      { "internalType": "uint96", "name": "nonce", "type": "uint96" },
      { "internalType": "address", "name": "operator", "type": "address" },
      { "internalType": "address", "name": "token0", "type": "address" },
      { "internalType": "address", "name": "token1", "type": "address" },
      { "internalType": "uint24", "name": "fee", "type": "uint24" },
      { "internalType": "int24", "name": "tickLower", "type": "int24" },
      { "internalType": "int24", "name": "tickUpper", "type": "int24" },
      { "internalType": "uint128", "name": "liquidity", "type": "uint128" },
      { "internalType": "uint256", "name": "feeGrowthInside0LastX128", "type": "uint256" },
      { "internalType": "uint256", "name": "feeGrowthInside1LastX128", "type": "uint256" },
      { "internalType": "uint128", "name": "tokensOwed0", "type": "uint128" },
      { "internalType": "uint128", "name": "tokensOwed1", "type": "uint128" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // collect
  {
    "inputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint128", "name": "amount0Max", "type": "uint128" },
          { "internalType": "uint128", "name": "amount1Max", "type": "uint128" }
        ],
        "internalType": "struct INonfungiblePositionManager.CollectParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "collect",
    "outputs": [
      { "internalType": "uint256", "name": "amount0", "type": "uint256" },
      { "internalType": "uint256", "name": "amount1", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  // Transfer event
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

(async () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(managerAddress, abi, signer);

  const mintParams = {
    token0: "0x31F072395183717C51181f0E27651c50AAbAb8f9",
    token1: "0xd7Ba6C5A944c528de8F2ADad98D97303166B74D6",
    fee: 3000,
    tickLower: -60,
    tickUpper: 60,
    amount0Desired: ethers.parseUnits("1.0", 18),
    amount1Desired: ethers.parseUnits("1.0", 18),
    amount0Min: 0,
    amount1Min: 0,
    recipient: signer.address,
    deadline: 1720000000
  };

  console.log("mint 実行中...");
  const tx = await contract.mint(mintParams, {
    gasLimit: 5000000
  });

  console.log("Tx hash:", tx.hash);

  const receipt = await tx.wait();

  const iface = new ethers.Interface(abi);
  let tokenId = null;

  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed.name === "Transfer") {
        tokenId = parsed.args.tokenId.toString();
        console.log("取得した tokenId:", tokenId);
      }
    } catch (e) {
      // skip
    }
  }

  if (!tokenId) {
    console.log("tokenId が取得できませんでした。");
    process.exit(1);
  }

  console.log("positions を呼び出します...");
  const pos = await contract.positions(tokenId);
  console.log("ポジション情報:", pos);

})();
