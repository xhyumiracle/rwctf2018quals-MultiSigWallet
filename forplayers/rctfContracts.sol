pragma solidity ^0.4.24;
contract MultiSigWallet{
	struct Transaction{
		address target;
		uint amount;
		bool isDelegate;
		bytes data;
	}
	Transaction[] transactions;
	mapping(address => bool) isOwner;
    mapping(address => bool) isTrusted;
	Transaction tx;
    
	constructor() public{
		isOwner[msg.sender] = true;
	}

	modifier onlyTrustedTarget(address target){
		require(isTrusted[target]);
		_;
	}

	modifier onlyOwner(){
		require(isOwner[msg.sender]);
		_;
	}
	
	modifier onlyWallet(){
	    require(address(this) == msg.sender);
	    _;
	}
	
	function addTrusted(address addr) public onlyOwner{
	    isTrusted[addr] = true;
	}
	
	function rmTrusted(address addr) public onlyOwner{
	    isTrusted[addr] = false;
	}

	function addOwner(address newOwner) public onlyWallet{
		isOwner[newOwner] = true;
	}

    function imOwner() constant public returns(bool){
        return isOwner[msg.sender] == true;
    }

	function executeTransaction(uint id) public{
		tx = transactions[id];
		if (tx.isDelegate){
			executeDelegateCall(tx.target, tx.amount, tx.data);
		}else{
			executeCall(tx.target, tx.amount, tx.data);
		}
	}

	function deleteTransaction(uint id) public{
		for (uint i = id; i < transactions.length-1; i++){
			transactions[i] = transactions[i+1];
		}
		popTransaction();
	}

	// there's no pop impl in solidity, sad :(
	function popTransaction() internal {
		require(transactions.length >= 0);
		transactions.length --;
	}

	function executeCall(address target, uint amount, bytes data) internal{
		target.call.value(amount)(data);
	}
	
	function executeDelegateCall(address target, uint amount, bytes data) internal onlyTrustedTarget(target){
		target.delegatecall(data);
	}

	function submitTransaction(address target, uint amount, bool isDelegate, bytes data) public returns(uint){
		tx = Transaction(target, amount, isDelegate, data);
		if (isOwner[msg.sender]) {
			transactions.push(tx);
		}
		return transactions.length-1;
	}

	event Message(string m);
	
	function publishMessage(string m) public{
		emit Message(m);
	}
}

contract SimpleToken{
	mapping (address => bool) isOwner;
	mapping (address => uint) balances;
	address walletAddr;

	constructor() public{
        isOwner[msg.sender] = true;
	}

	modifier onlyOwner(){
		require(isOwner[msg.sender]);
		_;
	}

	modifier ownerDoesNotExist(address owner){
		require(!isOwner[owner]);
		_;
	}
	
	function grantToken(address addr) public onlyOwner {
	    balances[addr] = 100000000;
	}

	function setOwner(address owner)
    public
    onlyOwner
    ownerDoesNotExist(owner)
    {
        isOwner[owner] = true;
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _amount);

    function balanceOf(address account) constant public returns(uint){
        return balances[account];
    }

    function transfer(address to, uint amount) public {
    	require(balances[msg.sender] >= amount);
    	require(balances[to] + amount >= amount);
    	balances[msg.sender] -= amount;
    	balances[to] += amount;
    	emit Transfer(msg.sender, to, amount);
    }
}
