	let bitcoin = require("bitcoinjs-lib");
	let bip65 = require('bip65');

	function cltvCheckSigOutput (aQ, bQ, lockTime) {
		return bitcoin.script.compile([
		  bitcoin.opcodes.OP_IF,
		  bitcoin.script.number.encode(lockTime),
		  bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
		  bitcoin.opcodes.OP_DROP,

		  bitcoin.opcodes.OP_ELSE,
		  bQ.publicKey,
		  bitcoin.opcodes.OP_CHECKSIGVERIFY,
		  bitcoin.opcodes.OP_ENDIF,

		  aQ.publicKey,
		  bitcoin.opcodes.OP_CHECKSIG
		])
	  }		

	  function utcNow () {
		return Math.floor(Date.now() / 1000)
	  }
	let NETWORK = bitcoin.networks.testnet;  
	let alice = bitcoin.ECPair.fromWIF('cScfkGjbzzoeewVWmU2hYPUHeVGJRDdFt7WhmrVVGkxpmPP8BHWe', NETWORK); 
	let bob = bitcoin.ECPair.fromWIF('cMkopUXKWsEzAjfa1zApksGRwjVpJRB3831qM9W4gKZsLwjHXA9x', NETWORK) 
	let lockTime = bip65.encode({ utc: utcNow() - (3600 * 3) });
	let redeemScript = cltvCheckSigOutput(alice, bob, lockTime);
	let scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript));
	let address = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	console.log(address);