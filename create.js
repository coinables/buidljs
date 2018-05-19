let bitcoin = require("bitcoinjs-lib");
bitcoin.bigi = require('bigi');
bitcoin.Buffer = require('safe-buffer').Buffer;

function createP2PKH(){
	  var NETWORK = bitcoin.networks.bitcoin;
	  var wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
	  var keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  var newaddy = keyPair.getAddress();
	  return {
		  pk: wif,
		  addr: newaddy
	  }; 
}

function createP2WPKH(){
	  var NETWORK = bitcoin.networks.bitcoin;
	  var wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
	  var keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  var pubKey = keyPair.getPublicKeyBuffer();
	  var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
	  var newaddy = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  return {
		  pk: wif,
		  addr: newaddy
	  };
}

function createP2SHP2WPKH(){
	  var NETWORK = bitcoin.networks.bitcoin;
	  var wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
	  var keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  var pubKey = keyPair.getPublicKeyBuffer();
	  var pubKeyHash = bitcoin.crypto.hash160(pubKey);
	  var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
	  var redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	  var scriptPubKey = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	  var newaddy = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  return {
		  pk: wif,
		  addr: newaddy
	  };
}

function getNewAddress(){
	  var NETWORK = bitcoin.networks.bitcoin;
	  var wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
	  var keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  
	  //p2pkh
	  var p2pkhAddr = keyPair.getAddress();
	  
	  //native witness
	  var pubKey = keyPair.getPublicKeyBuffer();
	  var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
	  var p2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  
	  //p2sh witness
	  var pubKeyHash = bitcoin.crypto.hash160(pubKey);
	  var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
	  var redeemScriptHex = redeemScript.toString('hex');
	  var redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	  var scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	  var p2shp2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey2, NETWORK);
	  
	  return {
		  pk: wif,
		  p2pkh: p2pkhAddr,
		  p2wpkh: p2wpkhAddr,
		  p2shp2wpkh: p2shp2wpkhAddr ,
		  redeemScript: redeemScriptHex
	  }; 
}

function getDetails(inputWIF){
	  var NETWORK = bitcoin.networks.bitcoin;
	  var wif = inputWIF;
	  var keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  
	  //p2pkh
	  var p2pkhAddr = keyPair.getAddress();
	  
	  //native witness
	  var pubKey = keyPair.getPublicKeyBuffer();
	  var pubKeyHex = pubKey.toString('hex');
	  var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
	  var p2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  
	  //p2sh witness
	  var pubKeyHash = bitcoin.crypto.hash160(pubKey);
	  var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
	  var redeemScriptHex = redeemScript.toString('hex');
	  var redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	  var scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	  var p2shp2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey2, NETWORK);
	  
	  return {
		  pk: wif,
		  p2pkh: p2pkhAddr,
		  p2wpkh: p2wpkhAddr,
		  p2shp2wpkh: p2shp2wpkhAddr, 
		  redeemScript: redeemScriptHex, 
		  publicKey: pubKeyHex
	  }; 
}

function validateAddress(address){
	  try {
		bitcoin.address.toOutputScript(address)
		return true
	  } catch (e) {
		return false
	  }
}

function createTransaction(typei, txidi, outni, outputi, amounti, wifi, changeout, changeamt, inputvalue){
	//typei indicate input type by using 1st character of address type spending from
	//examples 
	//createTransaction("1", "34eceJ...  > spends from p2pkh
	//createTransaction("3", "34eceJ...  > spending from p2sh-p2wpkh
	//createTransaction("b", "34eceJ...  > spending from p2wpk(bech32)
	//
	//spending from segwit addresses (p2sh or native) you must specify inputvalue, this is the full value of the unspent output being spent which becomes the input in the new transaction
	//examples
	//createTransaction("3", "34eceJ..", 0, "1P5Ef7FsaD1KsJNSTUcACceEWN9vsUe3eN", 350000, "L1RLQhjuGoQ37QP4jfaEFTHMuEUeh4JdUDkx32xeafhnpzRMDMXD", null, null, 4000000)
	if(typei=="1"){
		//legacy address starts with a 1
		//create transaction
		let mainnet = bitcoin.networks.bitcoin;
		let txb = new bitcoin.TransactionBuilder(mainnet);

		let txid = txidi;
		let outn = outni;

		//input
		txb.addInput(txid, outn);

		//output
		txb.addOutput(outputi, amounti);
		
		//check for change output
		if(validateAddress(changeout)){
			txb.addOutput(changeout, changeamt);
		}
		
		//sign transaction
		let WIF = wifi;
		let keypairSpend = bitcoin.ECPair.fromWIF(WIF, mainnet);
		txb.sign(0,keypairSpend);

		//buidl transaction
		let tx = txb.build();
		let txhex = tx.toHex();
		return {
			signedtx: txhex
		}
	} else if(typei=="3"){
		//p2sh segwit, starts with a 3
		//create transaction
		let mainnet = bitcoin.networks.bitcoin;
		let txb = new bitcoin.TransactionBuilder(mainnet);

		let txid = txidi;
		let outn = outni;

		//need scriptPubKey for adding input
		let WIF = wifi; //private key of p2sh-p2wpkh output
		let keypair = bitcoin.ECPair.fromWIF(WIF, NETWORK);
		let pubKey = keypair.getPublicKeyBuffer();
		let pubKeyHash = bitcoin.crypto.hash160(pubKey);
		let redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
		let redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
		let scriptPubkey = bitcoin.script.scriptHash.output.encode(redeemScriptHash);

		//add input
		txb.addInput(txid, outn, null, scriptPubkey);

		//output
		txb.addOutput(outputi, amounti);
		
		//check for change output
		if(validateAddress(changeout)){
			txb.addOutput(changeout, changeamt);
		}
		
		//sign transaction
		txb.sign(0, keypair, redeemScript, null, inputvalue); 

		//buidl transaction
		let tx = txb.build();
		let txhex = tx.toHex();
		return {
			signedtx: txhex
		}
	} else if(typei=="b"){
		//bech32 native segwit
		//create transaction
		let mainnet = bitcoin.networks.bitcoin;
		let txb = new bitcoin.TransactionBuilder(mainnet);

		let txid = txidi;
		let outn = outni;

		//need scriptPubKey for adding input
		let WIF = wifi; //private key of p2sh-p2wpkh output
		let keypair = bitcoin.ECPair.fromWIF(WIF, NETWORK);
		let scriptPubkey = bitcoin.script.witnessPubKeyHash.output.encode(
							   bitcoin.crypto.hash160(	
								   keypair.getPublicKeyBuffer()
							   )
						   );

		//add input
		txb.addInput(txid, outn, null, scriptPubkey);

		//output
		txb.addOutput(outputi, amounti);
		
		//check for change output
		if(validateAddress(changeout)){
			txb.addOutput(changeout, changeamt);
		}
		
		//sign transaction
		txb.sign(0, keypair, null, null, inputvalue); 

		//buidl transaction
		let tx = txb.build();
		let txhex = tx.toHex();
		return {
			signedtx: txhex
		}
	} else {
		return {
			signedtx: "invalid type 1st argument must be string '1','3',or'b' depending on address type spending from"
		}
	}
	
}



module.exports = {
	createP2PKH,
	createP2WPKH,
	createP2SHP2WPKH,
	getNewAddress,
	getDetails,
	validateAddress,
	createTransaction,
	bitcoin
}

//binding functions to buidl 
//browserify create.js --standalone buidl > buidl.js

//main user preferred function names
///////////////////////
//getnewaddress
//newaddress
//newaddr
///////////////////////

//createnewtransaction
//newtransaction
//newtx

