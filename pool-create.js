const { ethers } = require("ethers");

// ⚠️ 本番環境で秘密鍵を直書きするのは絶対に非推奨。
// テスト用・理解のための例です。
const RPC_URL = "https://make-cph-great-again.community";
const PRIVATE_KEY = "0x80829c0056febd5df8ea7cecf10aa3ffded0127c695a410a03b20b5202e99937"; 

// Uniswap V3 NonfungiblePositionManager のアドレス
const positionManagerAddress = "0x08157C8532CF753FE63C5403515cBa8f1235189A";

// Uniswap V3 Factory のアドレス
const factoryAddress = "0x84a4Ef6C41f3Ab726c3A2550d284E37b45FC25D0";

// あなたのテストトークン
let tokenA = "0x7A6C53B0ADC6730C6FF70b28545E46CFc12Fc116";
let tokenB = "0x2610c6FCB401C072657d8fb6C1F5839FdAc109C1";

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // token のアドレス順をソート (必須)
  if (tokenA.toLowerCase() > tokenB.toLowerCase()) {
    [tokenA, tokenB] = [tokenB, tokenA];
  }

  const fee = 3000; // 0.3%

  // sqrtPriceX96 = sqrt(1) * 2^96 = 2^96
  const sqrtPriceX96 = ethers.toBigInt("79228162514264337593543950336"); // 1:1 の初期価格

  // NonfungiblePositionManager の Contract インスタンス作成
  const positionManagerABI = [
    "function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96) external returns (address pool)"
  ];

  const positionManager = new ethers.Contract(
    positionManagerAddress,
    positionManagerABI,
    wallet
  );

  // Factory の Contract インスタンス
  const factoryABI = [
    "function getPool(address token0, address token1, uint24 fee) external view returns (address)"
  ];

  const factory = new ethers.Contract(
    factoryAddress,
    factoryABI,
    provider
  );

  try {
    // プール作成トランザクション送信
    const tx = await positionManager.createAndInitializePoolIfNecessary(
      tokenA,
      tokenB,
      fee,
      sqrtPriceX96
    );

    console.log("トランザクション送信:", tx.hash);

    const receipt = await tx.wait();
    console.log("トランザクション完了:", receipt.hash);

    // プールが本当に作成されたか確認
    const poolAddress = await factory.getPool(tokenA, tokenB, fee);

    console.log("プールアドレス:", poolAddress);

    if (poolAddress === ethers.ZeroAddress) {
      console.log("⚠️ プールは作成されていません。");
    } else {
      console.log("✅ プールが作成されました！:", poolAddress);
    }

  } catch (err) {
    console.error("プール作成失敗:", err);
    if (err?.data) {
      console.error("Revert Data:", err.data);
    }
    process.exit(1);
  }
}

main();
