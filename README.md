RealWorldCTF 2018 Qualifier - MultiSigWallet
-----------------------

## Description

Hey dud, tell you what, I was learning Solidity and has created a wallet contract for myself to help me manage my HUGE amount of valuable tokens! I've double checked the code, it's handy and secure, nice and cool, I just love it! I'm pretty confident about the fact that no one could ever stolen my token through the wallet, NO ONE!!! You don't believe it? Try it! Hhhhhhhhh...

files provided: forplayers/
deploy.js, genesis.json and the contract source code are provided FYI.

It could take about 10-20 seconds for the flag to be delievered after you solved it.

use 0xd05f77446359c68feb753a542db4f8a69a6566c9 to play, it's already unlocked

## Env
```
$ cd deploy
$ docker build -t msw .
$ docker run -it --rm -p 8545:8545 --name chal1 msw
```

## PoC
```
$ cd poc
$ docker build -t msw-poc .
$ docker run -it --rm --name poc1 msw-poc
```

## Info
https://ctftime.org/task/6366
To make it player-friendly, I've modified part of the deploy logic that doesn't affect the chal itself, so it doesn't match with the exact env with the one during the competition but the core logic doesn't change at all.
