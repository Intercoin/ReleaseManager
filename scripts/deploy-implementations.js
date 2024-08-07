const fs = require('fs');
//const HDWalletProvider = require('truffle-hdwallet-provider');

function get_data(_message) {
    return new Promise(function(resolve, reject) {
        fs.readFile('./scripts/arguments.json', (err, data) => {
            if (err) {
				
                if (err.code == 'ENOENT' && err.syscall == 'open' && err.errno == -4058) {
                    fs.writeFile('./scripts/arguments.json', "", (err2) => {
                        if (err2) throw err2;
                        resolve();
                    });
                    data = ""
                } else {
                    throw err;
                }
            }
    
            resolve(data);
        });
    });
}

function write_data(_message) {
    return new Promise(function(resolve, reject) {
        fs.writeFile('./scripts/arguments.json', _message, (err) => {
            if (err) throw err;
            console.log('Data written to file');
            resolve();
        });
    });
}

async function main() {
	var data = await get_data();

    var data_object_root = JSON.parse(data);
	var data_object = {};
	if (typeof data_object_root[hre.network.name] === 'undefined') {
        data_object.time_created = Date.now()
    } else {
        data_object = data_object_root[hre.network.name];
    }
	//----------------

	// const [deployer] = await ethers.getSigners();
    var signers = await ethers.getSigners();
    var deployer;
    if (signers.length == 1) {
        deployer = signers[0];
    } else {
        [,deployer,] = signers;
    }
	
	const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
	console.log(
		"Deploying contracts with the account:",
		deployer.address
	);

	// var options = {
	// 	//gasPrice: ethers.utils.parseUnits('50', 'gwei'), 
	// 	gasLimit: 10e6
	// };

    const deployerBalanceBefore = await ethers.provider.getBalance(deployer.address);
	console.log("Account balance:", (deployerBalanceBefore).toString());

    const ReleaseManagerF = await ethers.getContractFactory("ReleaseManager");

	let implementationReleaseManager    = await ReleaseManagerF.connect(deployer).deploy();
	
    await implementationReleaseManager.waitForDeployment();

	console.log("Implementations:");
	console.log("  ReleaseManager deployed at:       ", implementationReleaseManager.target);

	data_object.implementationReleaseManager = implementationReleaseManager.target;
    
    const deployerBalanceAfter = await ethers.provider.getBalance(deployer.address);
	console.log("Spent:", ethers.formatEther(deployerBalanceBefore - deployerBalanceAfter));
    console.log("gasPrice:", ethers.formatUnits((await network.provider.send("eth_gasPrice")), "gwei")," gwei");
    //console.log("getGasPrice:", await hre.network.getGasPrice());
    //console.log("eth_blockNumber:", await network.provider.send("eth_blockNumber"));
    
    
    
	//---
	const ts_updated = Date.now();
    data_object.time_updated = ts_updated;
    data_object_root[`${hre.network.name}`] = data_object;
    data_object_root.time_updated = ts_updated;
    let data_to_write = JSON.stringify(data_object_root, null, 2);
	console.log(data_to_write);
    await write_data(data_to_write);

    const networkName = hre.network.name;
    if (networkName == 'hardhat') {
        console.log("skipping verifying for  'hardhat' network");
    } else {
        console.log("Starting verifying:");
        await hre.run("verify:verify", {address: implementationReleaseManager.target, constructorArguments: []});
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
  });