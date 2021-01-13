let fs = require("fs");
let Web3 = require('web3');
let web3 = new Web3();
var password = fs.readFileSync("password.txt").toString().trim();
var privk = fs.readFileSync("privkey.txt").toString().trim();

// web3@0.20.7
web3.setProvider(new web3.providers.HttpProvider('http://localhost:'+process.argv[2]));

function importAccount(){
    console.log("Importing account")
    try{
        var account = web3.personal.importRawKey(privk, password)
        console.log(account)
    } catch(e) {
        console.log(e)
    }
}

function setDefaultAccountUnlock(){
    console.log("Unlocking coinbase account");
    web3.eth.defaultAccount = web3.eth.coinbase;
    try {
        web3.personal.unlockAccount(web3.eth.defaultAccount, password);
    } catch(e) {
        console.log(e)
        return;
    }
}

function getContract(contractName){
    let source = fs.readFileSync("rctfContracts.json");
    let contracts = JSON.parse(source)["contracts"];

    let abi = JSON.parse(contracts['rctfContracts.sol:'+contractName]['abi']);
    let code = '0x' + contracts['rctfContracts.sol:'+contractName]['bin'];

    let RctfContract = web3.eth.contract(abi);
    return [RctfContract, code];
}

function deploy(contractName, _gas){
    var rst = getContract(contractName);
    var RctfContract = rst[0];
    var code = rst[1];

    console.log("Deploying the contract");
    let contract = RctfContract.new({from: web3.eth.defaultAccount, gas: _gas, data: code});

    console.log("The contract is being deployed in transaction " + contract.transactionHash);
    return contract;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendFlagTo(contract){
    let flag = fs.readFileSync("flag.txt");
    console.log('unlocking account');
    setDefaultAccountUnlock()
    console.log('sending flag!');
    contract.publishMessage(flag.toString().trim());
}

function watchTransferEvent(wallet, token){
    var transferEvent = token.Transfer({fromBlock: 0, toBlock: 'latest'});
    transferEvent.watch(function(error, result){
        if (error) {console.log(error);}
        else{
            console.log(result.args);
            if(result.args._amount.toNumber() >= 1000000){
                sendFlagTo(wallet);
            }else{console.log('amount too low.')}
        }
    });
}


// We need to wait until any miner has included the transaction
// in a block to get the address of the contract
function waitGetContractAddr(contract) {
  while (true) {
    let receipt = web3.eth.getTransactionReceipt(contract.transactionHash);
    if (receipt && receipt.contractAddress) {
      console.log("The contract has been deployed at " + receipt.contractAddress);
      return receipt.contractAddress;
    }
    console.log("Waiting a mined block to include the contract... currently in block " + web3.eth.blockNumber);
    sleep(10000);
  }
}

function getContractInstance(contractName, contractAddr){
    return getContract(contractName)[0].at(contractAddr);
}

importAccount()
setDefaultAccountUnlock();

// deploy MultiSigWallet contract
walletC = deploy('MultiSigWallet', 3000000);
walletAddr = waitGetContractAddr(walletC);

// deploy SimpleToken contract
tokenC = deploy('SimpleToken', 1000000);
tokenAddr = waitGetContractAddr(tokenC);

// get contract instances
wallet = getContractInstance('MultiSigWallet', walletAddr);
token = getContractInstance('SimpleToken', tokenAddr);

// init txs
token.grantToken(walletAddr);
wallet.addTrusted(tokenAddr);

console.log('locking account');
web3.personal.lockAccount('0xa8c29ab108392022b1c46d7706fdf4f596ded3dd')

console.log('waiting for transfer event...');
watchTransferEvent(wallet, token);

