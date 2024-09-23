#!/bin/bash

export WEB3_RPC_URL=$7
export WEB3_PRIVATE_KEY=$6
export WEB3_ADDRESS=$4

web3 contract call --wait --abi $5 --gas-limit 2000000 --function safeTransferFrom $1 $2 $3