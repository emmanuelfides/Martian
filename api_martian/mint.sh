#!/bin/bash

export WEB3_RPC_URL=https://bsc-dataseed.binance.org
export WEB3_PRIVATE_KEY=$4
export WEB3_ADDRESS=$2

web3 contract call --wait --abi $3 --gas-limit 2000000 --function mint $1