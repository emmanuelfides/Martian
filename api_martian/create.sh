#!/bin/bash

export WEB3_RPC_URL=https://bsc-dataseed.binance.org
export WEB3_PRIVATE_KEY=$5


web3 generate contract erc721 --symbol $1 --name $2 --base-uri https://api.bettermentdigital.co:3000/item/view/$1/
web3 contract build $3
web3 contract deploy $4
