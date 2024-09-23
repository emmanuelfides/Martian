#!/bin/bash

export WEB3_RPC_URL=https://bsc-dataseed.binance.org
export WEB3_PRIVATE_KEY=$1
web3 transfer $3 to $2