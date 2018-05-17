# Buidl.js 

Buidl.js is a bitcoinjs-lib wrapper. 


# Usage
0. Save a copy of buidl.js or clone the repo

 *  `git clone https://github.com/coinables/buidljs.git`
 
 
1. Include `buidl.js` in your webpage

 *  `<script src="path/to/buidl.js"></script>`


2. Create a random key pair

        <head>
		<script src="buidl.js"></script>
		</head>
		<body>
		<script>
		let newPair = buidl.createP2PKH();
		let address = newPair.addr;
		let privateKey = newPair.pk;
		console.log(address, privateKey);
		</script>
		</body>


3. Get details of a private key

        <head>
		<script src="buidl.js"></script>
		</head>
		<body>
		<script>
		let WIF = "L4tm7p16LZ7e3EwydFTNFBDdknKrU7E1e6iXxkbFSF4FDFxcnyXG";
		let details = buidl.getDetails(WIF);
		console.log(details);
		</script>
		</body>

		
4. Build and sign a transaction 

 * createTransaction(typei, txidi, outni, outputi, amounti, wifi, changeout, changeamt, inputvalue)
 
 typei - string, indicate input type by using 1st character of address type spending from
 txidi - string, transaction id of unspent output being spent
 outni - integer, nout value of the unspent output being spent
 outputi - string, address of output "receiving" address
 amounti - integer, amount to send to output in satoshis (100,000,000 satoshis = 1 BTC)
 wifi - string, WIF private key of unspent output being spent
 changeout - string, Optional, change address or 2nd output address
 changeamt - integer, amount in satoshis to send to change address 
 inputvalue - integer, Required when spending from segwit unspent outputs, this is the full value of the unspent output being spent
 
		createTransaction("1", "34eceJ...  > spends from p2pkh
		createTransaction("3", "34eceJ...  > spending from p2sh-p2wpkh
		createTransaction("b", "34eceJ...  > spending from p2wpk(bech32)

		createTransaction("3", "34eceJ..", 0, "1P5Ef7FsaD1KsJNSTUcACceEWN9vsUe3eN", 350000, "L1RLQhjuGoQ37QP4jfaEFTHMuEUeh4JdUDkx32xeafhnpzRMDMXD", null, null, 4000000)


## Additional Info

		
=======
BTC:  3LnBzPmb3BkDUZBHLHdEj5vgxS6D6HjKLW
=======

