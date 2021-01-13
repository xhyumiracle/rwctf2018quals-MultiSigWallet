#!/bin/bash

DATA_DIR=/root/data.ethereum
GENESIS_NAME=/root/genesis.json

mkdir log

echo '[*] setting up geth with genesis.json'
geth --datadir $DATA_DIR init $GENESIS_NAME

nohup geth --datadir $DATA_DIR --syncmode "fast" --networkid 112358 --nodiscover --rpc --rpcaddr "0.0.0.0" --rpccorsdomain "*" --rpcapi "web3,eth,personal" --mine --minerthreads 1 --nat "any" --unlock "0,1" --password bppwd --allow-insecure-unlock --etherbase 0x992b55b2296a02e3d855140ebf26a50425c67e78 2>&1 >/root/log/minergeth.log &
#--cache 0 

sleep 5

nohup node deploy.js 8545 2>&1 | tee log/deploy.log &

tail -f /dev/null
