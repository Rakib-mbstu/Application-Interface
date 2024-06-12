const grpc = require("@grpc/grpc-js");
const { connect, signers } = require("@hyperledger/fabric-gateway");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");
const { TextDecoder } = require("util");

const channelName = envOrDefault("CHANNEL_NAME", "mychannel");
const chaincodeName = envOrDefault("CHAINCODE_NAME", "basic");

//mspId
let mspId = envOrDefault("MSP_ID", "Org1MSP");

//dirName
let cryptoPath = envOrDefault(
  "CRYPTO_PATH",
  path.resolve(
    __dirname,
    "../../../../test-network/organizations/peerOrganizations/org1.example.com"
  )
);

//keyPath
let keyDirectoryPath = envOrDefault(
  "KEY_DIRECTORY_PATH",
  path.resolve(cryptoPath, "users/User1@org1.example.com/msp/keystore")
);

//certPath
let certDirectoryPath = envOrDefault(
  "CERT_DIRECTORY_PATH",
  path.resolve(cryptoPath, "users/User1@org1.example.com/msp/signcerts")
);

//tlsPath
let tlsCertPath = envOrDefault(
  "TLS_CERT_PATH",
  path.resolve(cryptoPath, "peers/peer0.org1.example.com/tls/ca.crt")
);

//peerPoint
let peerEndpoint = envOrDefault("PEER_ENDPOINT", "localhost:7051");
//peerHost
let peerHostAlias = envOrDefault("PEER_HOST_ALIAS", "peer0.org1.example.com");

const utf8Decoder = new TextDecoder();

async function getLicenses(newDataPath) {
  console.log(newDataPath);
  mspId = newDataPath.mspId;
  cryptoPath = path.resolve(newDataPath.dirName);
  keyDirectoryPath = path.resolve(cryptoPath, newDataPath.keyPath);
  certDirectoryPath = path.resolve(cryptoPath, newDataPath.certPath);
  tlsCertPath = path.resolve(cryptoPath, newDataPath.tlsPath);
  peerEndpoint = newDataPath.peerPoint;
  peerHostAlias = newDataPath.peerHost;

  await displayInputParameters();

  const client = await newGrpcConnection();

  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    evaluateOptions: () => {
      return { deadline: Date.now() + 5000 };
    },
    endorseOptions: () => {
      return { deadline: Date.now() + 15000 };
    },
    submitOptions: () => {
      return { deadline: Date.now() + 5000 };
    },
    commitStatusOptions: () => {
      return { deadline: Date.now() + 60000 };
    },
  });

  try {
    const network = gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    await initLedger(contract);
    const data = await GetAllLicenses(contract);
    return data;
  } finally {
    gateway.close();
    client.close();
  }
}

async function createLicenseCall(newDataPath, id, name, proprietor, remarks) {
  console.log(newDataPath);
  mspId = newDataPath.mspId;
  cryptoPath = path.resolve(newDataPath.dirName);
  keyDirectoryPath = path.resolve(cryptoPath, newDataPath.keyPath);
  certDirectoryPath = path.resolve(cryptoPath, newDataPath.certPath);
  tlsCertPath = path.resolve(cryptoPath, newDataPath.tlsPath);
  peerEndpoint = newDataPath.peerPoint;
  peerHostAlias = newDataPath.peerHost;
  await displayInputParameters();
  const client = await newGrpcConnection();

  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    evaluateOptions: () => {
      return { deadline: Date.now() + 5000 };
    },
    endorseOptions: () => {
      return { deadline: Date.now() + 15000 };
    },
    submitOptions: () => {
      return { deadline: Date.now() + 5000 };
    },
    commitStatusOptions: () => {
      return { deadline: Date.now() + 60000 };
    },
  });

  try {
    const network = gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    await createLicense(contract, id, name, proprietor, remarks);
  } finally {
    gateway.close();
    client.close();
  }
}

async function newGrpcConnection() {
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    "grpc.ssl_target_name_override": peerHostAlias,
  });
}

async function newIdentity() {
  const certPath = await getFirstDirFileName(certDirectoryPath);
  const credentials = await fs.readFile(certPath);
  return { mspId, credentials };
}

async function getFirstDirFileName(dirPath) {
  const files = await fs.readdir(dirPath);
  return path.join(dirPath, files[0]);
}

async function newSigner() {
  const keyPath = await getFirstDirFileName(keyDirectoryPath);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

async function initLedger(contract) {
  console.log(
    "\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger"
  );

  await contract.submitTransaction("InitLedger");
  console.log("*** Transaction committed successfully");
}

async function GetAllLicenses(contract) {
  console.log(
    "\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger"
  );

  const resultBytes = await contract.evaluateTransaction("GetAllLicenses");
  const resultJson = utf8Decoder.decode(resultBytes);
  const result = JSON.parse(resultJson);
  console.log("*** Result:", result);
  return result;
}

async function createLicense(contract, id, name, proprietor, remarks) {
  console.log(
    "\n--> Submit Transaction: CreateAsset, creates new asset with ID, Name, Remarks and Certifier arguments"
  );

  await contract.submitTransaction(
    "CreateLicense",
    id,
    name,
    proprietor,
    remarks
  );
  console.log("*** Transaction committed successfully");
}

function envOrDefault(key, defaultValue) {
  return process.env[key] || defaultValue;
}

async function displayInputParameters() {
  console.log(`channelName:       ${channelName}`);
  console.log(`chaincodeName:     ${chaincodeName}`);
  console.log(`mspId:             ${mspId}`);
  console.log(`cryptoPath:        ${cryptoPath}`);
  console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
  console.log(`certDirectoryPath: ${certDirectoryPath}`);
  console.log(`tlsCertPath:       ${tlsCertPath}`);
  console.log(`peerEndpoint:      ${peerEndpoint}`);
  console.log(`peerHostAlias:     ${peerHostAlias}`);
}

module.exports = { getLicenses,createLicenseCall };
