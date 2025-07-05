#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from web3 import Web3
from dotenv import load_dotenv

# .env 読み込み
load_dotenv()

RPC_URL = os.getenv("RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
ACCOUNT_ADDRESS = os.getenv("YOUR_WALLET_ADDRESS")

if ACCOUNT_ADDRESS is None:
    raise Exception("YOUR_WALLET_ADDRESS が .env に設定されていません。")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

print("Connected:", w3.is_connected())

ACCOUNT_ADDRESS = w3.to_checksum_address(ACCOUNT_ADDRESS)

POSITION_MANAGER = w3.to_checksum_address("0x96c8C289fD5a8De8A7d8Bfddd6066b7CdC2d07a7")

# NonfungiblePositionManager ABI (positions 関数のみ)
POSITION_MANAGER_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "positions",
        "outputs": [
            {"internalType": "uint96", "name": "nonce", "type": "uint96"},
            {"internalType": "address", "name": "operator", "type": "address"},
            {"internalType": "address", "name": "token0", "type": "address"},
            {"internalType": "address", "name": "token1", "type": "address"},
            {"internalType": "uint24", "name": "fee", "type": "uint24"},
            {"internalType": "int24", "name": "tickLower", "type": "int24"},
            {"internalType": "int24", "name": "tickUpper", "type": "int24"},
            {"internalType": "uint128", "name": "liquidity", "type": "uint128"},
            {"internalType": "uint256", "name": "feeGrowthInside0LastX128", "type": "uint256"},
            {"internalType": "uint256", "name": "feeGrowthInside1LastX128", "type": "uint256"},
            {"internalType": "uint128", "name": "tokensOwed0", "type": "uint128"},
            {"internalType": "uint128", "name": "tokensOwed1", "type": "uint128"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

position_manager = w3.eth.contract(address=POSITION_MANAGER, abi=POSITION_MANAGER_ABI)

# ★★★ここを書き換えて★★★
# 例えば先ほど mint の tx で出力された tokenId を入れる
TOKEN_ID = 1

# 呼び出し
pos = position_manager.functions.positions(TOKEN_ID).call()

print("Position Info for tokenId =", TOKEN_ID)
print("nonce:", pos[0])
print("operator:", pos[1])
print("token0:", pos[2])
print("token1:", pos[3])
print("fee:", pos[4])
print("tickLower:", pos[5])
print("tickUpper:", pos[6])
print("liquidity:", pos[7])
print("feeGrowthInside0LastX128:", pos[8])
print("feeGrowthInside1LastX128:", pos[9])
print("tokensOwed0:", pos[10])
print("tokensOwed1:", pos[11])
