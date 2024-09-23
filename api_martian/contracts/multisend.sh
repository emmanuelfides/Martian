#!/bin/bash

export WEB3_RPC_URL=https://bsc-dataseed.binance.org/
export WEB3_PRIVATE_KEY=7539b67d11e90b5ecd0d58c30097963e21c37da4639aca29a9c06850aa3797b3

web3 contract build MultiSend.sol
web3 contract deploy MultiSend.bin
