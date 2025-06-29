const { ethers } = require("ethers");

// ⚠️ 本番環境で秘密鍵を直書きするのは非推奨。必ず env 等で管理してください。
const RPC_URL = "https://make-cph-great-again.community";
const PRIVATE_KEY = "80829c0056febd5df8ea7cecf10aa3ffded0127c695a410a03b20b5202e99937"; // 例: 0xabc...

// Uniswap V3 関連アドレス
const positionManagerAddress = "0x08157C8532CF753FE63C5403515cBa8f1235189A";
const factoryAddress = "0x84a4Ef6C41f3Ab726c3A2550d284E37b45FC25D0";

// あなたのテストトークン
let tokenA = "0x7A6C53B0ADC6730C6FF70b28545E46CFc12Fc116";
let tokenB = "0x2610c6FCB401C072657d8fb6C1F5839FdAc109C1";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // token アドレスの昇順にソート
  if (tokenA.toLowerCase() > tokenB.toLowerCase()) {
    [tokenA, tokenB] = [tokenB, tokenA];
  }

  const fee = 3000; // 0.3%

  // sqrtPriceX96 = sqrt(1) * 2^96 = 2^96
  const sqrtPriceX96 = ethers.toBigInt("79228162514264337593543950336"); // 1:1 の初期価格

  // Factory コントラクト
  const factoryABI = [
    "function getPool(address token0, address token1, uint24 fee) external view returns (address)"
  ];

  const factory = new ethers.Contract(
    factoryAddress,
    factoryABI,
    provider
  );

  // pool の存在確認
  const poolAddress = await factory.getPool(tokenA, tokenB, fee);
  console.log("Pool address:", poolAddress);

  if (poolAddress === ethers.ZeroAddress) {
    console.log("プールが存在しません。作成を開始します。");

    // NonfungiblePositionManager の createAndInitializePoolIfNecessary を呼ぶ
    const positionManagerABI = [
      "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external returns (address pool)"
    ];

    const positionManager = new ethers.Contract(
      positionManagerAddress,
      positionManagerABI,
      wallet
    );

    const tx = await positionManager.createAndInitializePoolIfNecessary(
      tokenA,
      tokenB,
      fee,
      sqrtPriceX96
    );

    console.log("トランザクション送信:", tx.hash);

    const receipt = await tx.wait();
    console.log("トランザクション完了:", receipt.hash);

    // 作成後の pool を再度取得
    const newPoolAddress = await factory.getPool(tokenA, tokenB, fee);
    console.log("✅ プールが作成されました！アドレス:", newPoolAddress);

  } else {
    console.log("✅ プールはすでに存在しています:", poolAddress);
  }
}

main();
