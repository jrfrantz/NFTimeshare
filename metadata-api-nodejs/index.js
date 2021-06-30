/* import TokenArtifact from "./src/contracts/Token.json";
import NFTimeshareArtifact from "./src/contracts/NFTimeshare.json";
import NFTimeshareMonthArtifact from "./src/contracts/NFTimeshareMonth.json";
import TestNFTArtifact from "./src/contracts/TestNFT.json";
import contractAddress from "./src/contracts/contract-address.json";*/

const express = require('express')
const path = require('path')
const { ethers } = require("ethers");
const axios = require('axios');
const PORT = process.env.PORT || 5000

const NFTimeshareArtifact      = require("./src/contracts/NFTimeshare.json");
const NFTimeshareMonthArtifact = require("./src/contracts/NFTimeshareMonth.json");
const contractAddress          = require("./src/contracts/contract-address.json");
let provider, nftimeshare, nftimesharemonth;

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

// Static public files
//app.use(express.static(path.join(__dirname, 'public')))

setupContracts();


//app.use('/', express.static('../frontend/build'));
/*app.get('/', async function(req, res) {
  //res.send('Get ready for OpenSea!');
  //var l = await provider.getBlockNumber();
  //var y = await nftimesharemonth.totalSupply();
  //res.send(y.toString());
})*/
/* app.get("/", async function(req, res) {
  console.log("asked to get root");
  res.sendFile(path.join(__dirname, "..", "frontend/build"));
})*/
app.use(express.static(path.join(__dirname, "..", "frontend/build")));
app.use(express.static("../frontend/public"));

// need one for timeshare and one for timesharemonth
app.get('/timesharemonth/:token_id', async function(req, res) {
  // 1/ get parent nft's tokenId for this timeshare
  // 2/ (contract, tokenId) = wrappedNFT (tokenId)
  // 3/ call and read URI of underlying
  const tokenId = parseInt(req.params.token_id);
  var underlyingTokenURI = await nftimesharemonth.underlyingTokenURI(tokenId);
  var monthStr = monthName(await nftimesharemonth.month(tokenId));
  var underlyingMetadata = (await axios.get(underlyingTokenURI)).json();


  if (!underlyingMetadata.attributes) {
    underlyingMetadata.attributes = [];
  }
  underlyingMetadata.attributes.push({
    trait_type: "Month",
    value     : monthStr
  });

  res.json(underlyingMetadata);
})

app.get('/timeshare/:token_id', async function(req, res) {
  const tokenId = parseInt(req.params.token_id);
  res.json({"Hi": tokenId});
  console.log("Testo");
  return;
  var underlyingTokenURI = await ntfimeshare.underlyingTokenURI(tokenId);
  var underlyingMetadata = (await axios.get(underlyingTokenURI)).json();

  // process JSON here

  res.json(underlyingMetadata);
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})


function monthName(month) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
  return monthNames[month]
}

async function setupContracts() {
  provider = new ethers.providers.JsonRpcProvider();
  nftimeshare = new ethers.Contract(
    contractAddress.NFTimeshare,
    NFTimeshareArtifact.abi,
    provider.getSigner()
  );
  nftimesharemonth = new ethers.Contract(
    contractAddress.NFTimeshareMonth,
    NFTimeshareMonthArtifact.abi,
    provider.getSigner()
  );
}
