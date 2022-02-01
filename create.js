let bitcoin = require("bitcoinjs-lib");
bitcoin.bigi = require('bigi');
bitcoin.Buffer = require('safe-buffer').Buffer;
let bip38 = require('bip38');
bip38.wifEnc = require('wif');
let bip65 = require('bip65');
let bip39 = require('bip39');
let b58 = require('bs58check');

function createP2PKH(networkInput){
	  let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	  let wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
	  let keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  let newaddy = keyPair.getAddress();
	  return {
		  pk: wif,
		  addr: newaddy
	  }; 
}

function createP2WPKH(networkInput){
	  let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	  let wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
	  let keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  let pubKey = keyPair.getPublicKeyBuffer();
	  let scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
	  let newaddy = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  return {
		  pk: wif,
		  addr: newaddy
	  };
}

function createP2SHP2WPKH(networkInput){
	  let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	  let wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
	  let keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  let pubKey = keyPair.getPublicKeyBuffer();
	  let pubKeyHash = bitcoin.crypto.hash160(pubKey);
	  let redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
	  let redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	  let scriptPubKey = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	  let newaddy = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  return {
		  pk: wif,
		  addr: newaddy
	  };
}

function getNewAddress(networkInput){
	  let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	  let wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
	  let keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  
	  //p2pkh
	  let p2pkhAddr = keyPair.getAddress();
	  
	  //native witness
	  let pubKey = keyPair.getPublicKeyBuffer();
	  let scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
	  let p2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  
	  //p2sh witness
	  let pubKeyHash = bitcoin.crypto.hash160(pubKey);
	  let redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
	  let redeemScriptHex = redeemScript.toString('hex');
	  let redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	  let scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	  let p2shp2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey2, NETWORK);
	  
	  return {
		  pk: wif,
		  p2pkh: p2pkhAddr,
		  p2wpkh: p2wpkhAddr,
		  p2shp2wpkh: p2shp2wpkhAddr,
		  redeemScript: redeemScriptHex
	  }; 
}

function bip38Encrypt(key, phrase, networkInput){
	  let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	  let keyPair = bitcoin.ECPair.fromWIF(key, NETWORK);
	  
	  //p2pkh
	  let p2pkhAddr = keyPair.getAddress();
	  
	  //native witness
	  let pubKey = keyPair.getPublicKeyBuffer();
	  let scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
	  let p2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  
	  //p2sh witness
	  let pubKeyHash = bitcoin.crypto.hash160(pubKey);
	  let redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
	  let redeemScriptHex = redeemScript.toString('hex');
	  let redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	  let scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	  let p2shp2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey2, NETWORK);
	  
	  if(phrase != null){
		  let decoded = bip38.wifEnc.decode(key);
		  let encryptedKey = bip38.encrypt(decoded.privateKey, decoded.compressed, phrase);
		  return {
			  pk: encryptedKey,
			  p2pkh: p2pkhAddr,
			  p2wpkh: p2wpkhAddr,
			  p2shp2wpkh: p2shp2wpkhAddr,
			  redeemScript: redeemScriptHex
		  }; 
	  } else {
		  let encryptedKey = "missing passphrase parameter";
		  return {
			  pk: encryptedKey,
			  p2pkh: p2pkhAddr,
			  p2wpkh: p2wpkhAddr,
			  p2shp2wpkh: p2shp2wpkhAddr,
			  redeemScript: redeemScriptHex
		  }; 
	  } 
}

function bip38Decrypt(encryptedKey, phrase){
	let decryptedKey = bip38.decrypt(encryptedKey, phrase);
	let decryptFinish = bip38.wifEnc.encode(0x80, decryptedKey.privateKey, decryptedKey.compressed);
	return {
		pk: decryptFinish
	};
}

function getDetails(inputWIF, networkInput){
	  let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	  let wif = inputWIF;
	  let keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
	  
	  //p2pkh
	  let p2pkhAddr = keyPair.getAddress();
	  
	  //native witness
	  let pubKey = keyPair.getPublicKeyBuffer();
	  let pubKeyHex = pubKey.toString('hex');
	  let scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
	  let p2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	  
	  //p2sh witness
	  let pubKeyHash = bitcoin.crypto.hash160(pubKey);
	  let redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
	  let redeemScriptHex = redeemScript.toString('hex');
	  let redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	  let scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	  let p2shp2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey2, NETWORK);
	  
	  return {
		  pk: wif,
		  p2pkh: p2pkhAddr,
		  p2wpkh: p2wpkhAddr,
		  p2shp2wpkh: p2shp2wpkhAddr, 
		  redeemScript: redeemScriptHex, 
		  publicKey: pubKeyHex
	  }; 
}

function pubToAddress(publicKey, networkInput){
	let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	let pubKeyBuffer = new Buffer(publicKey, 'hex');
	let publicKeyHash = bitcoin.crypto.hash160(pubKeyBuffer);
	//p2pkh
	let address = bitcoin.address.toBase58Check(publicKeyHash, NETWORK.pubKeyHash);
	//p2wpkh
	let scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(publicKeyHash));
	let p2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	//p2sh-p2wpkh
	let redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(publicKeyHash);
	let redeemScriptHex = redeemScript.toString('hex');
	let redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	let scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	let p2shp2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey2, NETWORK);
	
	return {
		p2pkh: address,
		p2wpkh: p2wpkhAddr, 
		p2shp2wpkh: p2shp2wpkhAddr, 
		redeemScript: redeemScriptHex
	}
}

function validateAddress(address){
	  try {
		bitcoin.address.toOutputScript(address)
		return true
	  } catch (e) {
		return false
	  }
}

function sha256(shaInput, iterations){
    z = shaInput;
	for(i=0;i<iterations;i++){
		let data = z;
		z = bitcoin.crypto.sha256(data).toString('hex');
	}
	return z;
}


	

function createTransaction(typei, txidi, outni, outputi, amounti, wifi, changeout, changeamt, inputvalue, networkInput){
	let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
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
		let txb = new bitcoin.TransactionBuilder(NETWORK);

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
		let keypairSpend = bitcoin.ECPair.fromWIF(WIF, NETWORK);
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
		//create transaction
		let txb = new bitcoin.TransactionBuilder(NETWORK);

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
		//create transaction
		let txb = new bitcoin.TransactionBuilder(NETWORK);

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

function createFrom(srcInput, networkInput){
	let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	let hashInput = srcInput;
	let hash = bitcoin.crypto.sha256(bitcoin.Buffer.from(hashInput));
	let d = bitcoin.bigi.fromBuffer(hash);
	let keyPair = new bitcoin.ECPair(d);
	//p2pkh
	let wif = keyPair.toWIF();
	let p2pkhAddr = keyPair.getAddress();
	  
	//native witness
	let pubKey = keyPair.getPublicKeyBuffer();
	let pubKeyHex = pubKey.toString('hex');
	let scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
	let p2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	
	//p2sh witness
	let pubKeyHash = bitcoin.crypto.hash160(pubKey);
	let redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
	let redeemScriptHex = redeemScript.toString('hex');
	let redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
	let scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
	let p2shp2wpkhAddr = bitcoin.address.fromOutputScript(scriptPubKey2, NETWORK);
	  
	return {
		  pk: wif,
		  p2pkh: p2pkhAddr,
		  p2wpkh: p2wpkhAddr,
		  p2shp2wpkh: p2shp2wpkhAddr, 
		  redeemScript: redeemScriptHex, 
		  publicKey: pubKeyHex
	 }; 
}

function fromXpub(xpub, acctNumber, keyindex){
    var type = xpub.substring(0,1);
    if(type==="x"){
        var addr = bitcoin.HDNode.fromBase58(xpub).derivePath(acctNumber+"/"+keyindex).getAddress();
    } else if(type==="y"){
        var ypubconv = convertXpub(xpub,"xpub");
        var wallet = bitcoin.HDNode.fromBase58(ypubconv).derivePath(acctNumber+"/"+keyindex);
        //segwit p2sh
        var pubKey = wallet.keyPair.getPublicKeyBuffer();
        var pubKeyHash = bitcoin.crypto.hash160(pubKey);
        var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
        var redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
        var scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
        var addr = bitcoin.address.fromOutputScript(scriptPubKey2);
    } else if(type==="z"){
        var zpubconv = convertXpub(xpub,"xpub");
        var wallet = bitcoin.HDNode.fromBase58(zpubconv).derivePath(acctNumber+"/"+keyindex);
        //native witness
        var pubKey = wallet.keyPair.getPublicKeyBuffer();
        var pubKeyHex = pubKey.toString('hex');
        var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
        var addr = bitcoin.address.fromOutputScript(scriptPubKey);
    }
    
	return{
		addr
	};	
}

function xprvToWIF(xprv, change, index){
    var inputExt = convertXpub(xprv,"xprv");
	let wif = bitcoin.HDNode.fromBase58(inputExt).derivePath(change+"/"+index).keyPair.toWIF();
	return{
		wif
	}
}


function fromHDSeed(seed, deriv, account, change, index){
   let root = bitcoin.HDNode.fromSeedHex(seed);
   let acct = root.derivePath("m/"+deriv+"'/0'/"+account+"'");
   let xpub = acct.neutered().toBase58();
   let pair = acct.derivePath(change+"/"+index).keyPair;
   var wifkey = pair.toWIF();
    if(deriv===44){
        var address = pair.getAddress();
    } else if(deriv===49){
        var pubKey = pair.getPublicKeyBuffer();
        var pubKeyHash = bitcoin.crypto.hash160(pubKey);
        var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(pubKeyHash);
        var redeemScriptHash = bitcoin.crypto.hash160(redeemScript);
        var scriptPubKey2 = bitcoin.script.scriptHash.output.encode(redeemScriptHash);
        var address = bitcoin.address.fromOutputScript(scriptPubKey2);       
    } else if(deriv===84){
        var pubKey = pair.getPublicKeyBuffer();
        var pubKeyHex = pubKey.toString('hex');
        var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey));
        var address = bitcoin.address.fromOutputScript(scriptPubKey);
    }
   
   return{
	   addr: address,
	   pk: wifkey 
   }
}

function seedToXpub(seed, deriv, account){
   let root = bitcoin.HDNode.fromSeedHex(seed);
   let acct = root.derivePath("m/"+deriv+"'/0'/"+account+"'");
   var xpub = acct.neutered().toBase58();
   var outpub = xpub;
    if(deriv==84){
         var zpub = convertXpub(xpub,"zpub");
         outpub = zpub;
       } else if (deriv==49)
       {
         var ypub = convertXpub(xpub,"ypub");   
         outpub = ypub;  
       } 
       
       return outpub;
}

function seedToXprv(seed, deriv, account){
   var root = bitcoin.HDNode.fromSeedHex(seed);
   var acct = root.derivePath("m/"+deriv+"'/0'/"+account+"'");
   var xprv = acct.toBase58();
   var outprv = xprv;
	if(deriv==84){
	   var zprv = convertXpub(xprv,"zprv");
	   outprv = zprv;
	   } else if (deriv==49)
	   {
		   var yprv = convertXpub(xprv,"yprv");   
		   outprv = yprv;
	   }
	   return outprv;
}

function convertXpub(xpub,target){
    //source script https://github.com/jlopp/xpub-converter/blob/master/js/xpubConvert.js
    const prefixes = new Map(
  [
    ['xpub', '0488b21e'],
    ['ypub', '049d7cb2'],
    ['Ypub', '0295b43f'],
    ['zpub', '04b24746'],
    ['Zpub', '02aa7ed3'],
    ['tpub', '043587cf'],
    ['upub', '044a5262'],
    ['Upub', '024289ef'],
    ['vpub', '045f1cf6'],
    ['Vpub', '02575483'],
      ['xprv', '0488ade4'],
      ['yprv', '049d7878'],
      ['zprv', '04b2430c']
  ]
  );
    
  xpub = xpub.trim();

  try {
    var data = b58.decode(xpub);
    data = data.slice(4);
    data = Buffer.concat([Buffer.from(prefixes.get(target),'hex'), data]);
    return b58.encode(data);
  } catch (err) {
    return "Invalid extended public key! Please double check that you didn't accidentally paste extra data.";
  }    
}

function newMnemonic(){
	let words = bip39.generateMnemonic();
	return{
		words
	}
}

function verifyMnemonic(phrase){
	let validMnemonic = bip39.validateMnemonic(phrase);
	return{
		validMnemonic
	}
}

function mnemonic2SeedHex(mnemonicInput){
    seedHex = bip39.mnemonicToSeedSync(mnemonicInput).toString('hex')
	return{
		seedHex
	}
}

function entropy2Mnemonic(entropySrc){
	words = bip39.entropyToMnemonic(entropySrc);
	return{
		words
	}
}



function multisig(pubKey1, pubKey2, pubKey3, networkInput){
	let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	let pubKeys = [
		pubKey1,
		pubKey2,
		pubKey3
	].map(function (hex) { return Buffer.from(hex, 'hex') })

	let redeemScript = bitcoin.script.multisig.output.encode(2, pubKeys); // 2 of 3
	let scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript, NETWORK));
	let address = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	let redeemHex = redeemScript.toString('hex');
	return{
		addr: address,
		redeemScript: redeemHex
	}
}

function multisigRandom(m,n,networkInput){
	let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	if(m>n){
		return "your first parameter must be less than your second parameter";
	}
	let wifList = [];
	let pubList = [];
	for(var i=0;i<n;i++){
		let wif = bitcoin.ECPair.makeRandom({network: NETWORK}).toWIF();
		wifList.push(wif);
		let keyPair = bitcoin.ECPair.fromWIF(wif, NETWORK);
		let pubKey = keyPair.getPublicKeyBuffer();
		let pubKeyHex = pubKey.toString('hex');
		pubList.push(pubKeyHex);
	}
	
	
	let pubKeys = pubList.map(function (hex) { return Buffer.from(hex, 'hex') })
	
	let redeemScript = bitcoin.script.multisig.output.encode(m, pubKeys); // 2 of 3
	let scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript, NETWORK));
	let address = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	let redeemHex = redeemScript.toString('hex');
	let wifListToString = wifList.join();
	return{
		addr: address,
		redeemScript: redeemHex,
		privateKeys: wifListToString
	}
}

function cltv(privateKey, locktime, networkInput){
	
	let NETWORK = networkInput === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
	
	function cltvCheckSigOutput (ecPair, lockTimeInput) {
		return bitcoin.script.compile([
		  bitcoin.opcodes.OP_IF,
		  bitcoin.script.number.encode(lockTimeInput),
		  bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
		  bitcoin.opcodes.OP_DROP,

		  bitcoin.opcodes.OP_ELSE,
		  bitcoin.opcodes.OP_NOP,
		  bitcoin.opcodes.OP_ENDIF,

		  ecPair.publicKey,
		  bitcoin.opcodes.OP_CHECKSIG
		])
	  }		

	  function utcNow () {
		return Math.floor(Date.now() / 1000)
	  }
	
	let ecPairInput = bitcoin.ECPair.fromWIF(privateKey, NETWORK);  
	let lockTimeInput = bip65.encode({ utc: utcNow() + locktime });
	let redeemScript = cltvCheckSigOutput(ecPairInput, lockTimeInput);
	let redeemScriptHash160 = bitcoin.crypto.hash160(redeemScript);
	let redeemScriptHex = redeemScript.toString("hex");
	
	let scriptPubKey = bitcoin.script.scriptHash.output.encode(redeemScriptHash160);
	let address = bitcoin.address.fromOutputScript(scriptPubKey, NETWORK);
	
	return {
		addr: address,
		redeemScript: redeemScriptHex
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
	createFrom,
	bip38Encrypt,
	bip38Decrypt,
	fromXpub,
	xprvToWIF,
	fromHDSeed,
	seedToXpub,
	seedToXprv,
    convertXpub,
	newMnemonic,
	verifyMnemonic,
	mnemonic2SeedHex,
	entropy2Mnemonic,
	multisig,
	multisigRandom,
	cltv,
	pubToAddress,
	sha256,
	bitcoin
}

//binding functions to buidl 
//browserify create.js --standalone buidl > buidl.js



