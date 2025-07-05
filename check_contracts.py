#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from web3 import Web3
from dotenv import load_dotenv

# .env 読み込み（RPC_URL を想定）
load_dotenv()

RPC_URL = os.getenv("RPC_URL")

if RPC_URL is None:
    raise Exception("環境変数 RPC_URL が設定されていません。")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

print("Connected:", w3.is_connected())

addresses = {
    "NEXT_PUBLIC_WETH9_ADDRESS": "0x3c4a33f059c5f55059537d93e4a92b9fac389b1b",
    "NEXT_PUBLIC_UNISWAP_V3_FACTORY_ADDRESS": "0x84a4ef6c41f3ab726c3a2550d284e37b45fc25d0",
    "NEXT_PUBLIC_SWAP_ROUTER_ADDRESS": "0xaab7a983fc7eca2fb601cca7489e11d3945c6301",
    "NEXT_PUBLIC_QUOTER_ADDRESS": "0xf7edc0095eadb64f92d493a2a2d575f7b8b0810f",
    "NEXT_PUBLIC_TOKEN_DESCRIPTOR_ADDRESS": "0x934b59AE70F12cBe9BeBE0911844bb28D8c4A105",
    "NEXT_PUBLIC_POSITION_MANAGER_ADDRESS": "0x96c8C289fD5a8De8A7d8Bfddd6066b7CdC2d07a7",
    "NEXT_PUBLIC_UNISWAP_V3_POOL_DEPLOYER_ADDRESS": "0x66e6c89bd4e6fb9e9e5896abf125e9ff2c0b5f6a",
    "NEXT_PUBLIC_TICK_LENS_ADDRESS": "0xbb45bf3837f21e1d4640d4031da92d6d43e25853",
    "NEXT_PUBLIC_MULTICALL_ADDRESS": "0x9f929b446085467e587a80fd55e00b91a2961e83",
}

for name, addr in addresses.items():
    checksum_addr = w3.to_checksum_address(addr)
    code = w3.eth.get_code(checksum_addr)
    if code and len(code) > 2:
        print(f"✅ {name} ({addr}) はコントラクトが存在します (Code size = {len(code)} bytes).")
    else:
        print(f"❌ {name} ({addr}) は空アドレスです（コントラクト無し）.")
