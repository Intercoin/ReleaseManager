require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

const kovanURL = `https://eth-kovan.alchemyapi.io/v2/${process.env.ALCHEMY_KOVAN}`
const goerliURL = `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_GOERLI}`
const rinkebyURL = `https://rinkeby.infura.io/v3/${process.env.INFURA_ID_PROJECT}` //`https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_RINKEBY}`
const bscURL = 'https://bsc-dataseed.binance.org' //`https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_RINKEBY}`
const bsctestURL = 'https://data-seed-prebsc-1-s1.binance.org:8545';
const mainnetURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_MAINNET}`
const maticURL = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_MATIC}`
const mumbaiURL = 'https://matic-mumbai.chainstacklabs.com';
//const arbitrumURL = `https://endpoints.omniatech.io/v1/arbitrum/one/public`;
const arbitrumURL = `https://arbitrum-one.publicnode.com`;
const avalancheURL = `https://endpoints.omniatech.io/v1/avax/mainnet/public`;

module.exports = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
      gas: "auto",
      gasLimit: 22000000,
      forking: {
        url: mainnetURL,
        //blockNumber: "latest"
      }
    },
    kovan: {
      url: kovanURL,
      chainId: 42,
      gas: 12000000,
      accounts: [process.env.private_key],
      saveDeployments: true
    },
    goerli: {
      url: goerliURL,
      chainId: 5,
      gasPrice: 1000,
      accounts: [process.env.private_key],
      saveDeployments: true
    },
    rinkeby: {
      url: rinkebyURL,
      chainId: 4,
      gasPrice: "auto",
      accounts: [process.env.private_key],
      saveDeployments: true
    },
    bsc: {
      url: bscURL,
      chainId: 56,
      //gasPrice: "auto",
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_vanity
      ],
      saveDeployments: true
    },
    bsctest: {
      url: bsctestURL,
      chainId: 97,
      //gasPrice: "auto",
      accounts: [process.env.private_key],
      saveDeployments: true
    },
    matic: {
      url: maticURL,
      chainId: 137,
      gasPrice: "auto",
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_vanity
      ],
      saveDeployments: true
    },
    mumbai: {
      url: mumbaiURL,
      chainId: 80001,
      gasPrice: "auto",
      accounts: [process.env.private_key],
      saveDeployments: true
    },
    mainnet: {
      url: mainnetURL,
      chainId: 1,
      gasPrice: 20000000000,
      accounts: [process.env.private_key],
      saveDeployments: true
    },
    arbitrumOne: {
      url: arbitrumURL,
      chainId: 42161,
      gasPrice: "auto",
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_vanity
      ],
      saveDeployments: true
    },
    avalanche: {
      url: avalancheURL,
      chainId: 43114,
      gasPrice: "auto",
      accounts: [
        process.env.private_key,
        process.env.private_key_auxiliary,
        process.env.private_key_vanity
      ],
      saveDeployments: true
    }
  },
  // docgen: {
  //   theme: '../../docgen-custom-markdown',
  //   path: './docs',
  //   clear: true,
  //   runOnCompile: false,
  // },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  etherscan: {
    //apiKey: process.env.MATIC_API_KEY
    //apiKey: process.env.ETHERSCAN_API_KEY
    //apiKey: process.env.BSCSCAN_API_KEY
    apiKey: {
      polygonMumbai: process.env.MATIC_API_KEY,
      polygon: process.env.MATIC_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
      arbitrumOne: process.env.ARBITRUMONE_API_KEY,
      avalanche: process.env.AVALANCHE_API_KEY
    }
  },
  solidity: {
    compilers: [
        {
          version: "0.8.11",
          settings: {
            optimizer: {
              enabled: true,
              runs: 100,
            },
            metadata: {
              // do not include the metadata hash, since this is machine dependent
              // and we want all generated code to be deterministic
              // https://docs.soliditylang.org/en/v0.7.6/metadata.html
              bytecodeHash: "none",
            },
          },
        },
        {
          version: "0.6.7",
          settings: {},
          settings: {
            optimizer: {
              enabled: false,
              runs: 200,
            },
            metadata: {
              // do not include the metadata hash, since this is machine dependent
              // and we want all generated code to be deterministic
              // https://docs.soliditylang.org/en/v0.7.6/metadata.html
              bytecodeHash: "none",
            },
          },
        },
      ],
  
    
  },
  
  namedAccounts: {
    deployer: 0,
    },

  paths: {
    sources: "contracts",
  },
  gasReporter: {
    currency: 'USD',
    enabled: (process.env.REPORT_GAS === "true") ? true : false
  },
  mocha: {
    timeout: 200000
  }
}
