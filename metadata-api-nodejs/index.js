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
const alchemyKeyOnly = process.env.ALCHEMY_KEY || require('../secrets.json').alchemyKeyOnly;
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
//app.use(express.static(path.join(__dirname, "..", "frontend/build")));
//app.use(express.static("../frontend/public"));
//app.use(express.static(path.join(__dirname, "..", "dapp/build")));

// need one for timeshare and one for timesharemonth
app.get('/timesharemonth/:token_id', async function(req, res) {
  // 1/ get parent nft's tokenId for this timeshare
  // 2/ (contract, tokenId) = wrappedNFT (tokenId)
  // 3/ call and read URI of underlying
  try {
    const tokenId = parseInt(req.params.token_id);
    console.log(tokenId);
    var underlyingTokenURI = await nftimesharemonth.underlyingTokenURI(tokenId);
    var monthStr = monthName(await nftimesharemonth.month(tokenId));
    var parentId =           await nftimesharemonth.getParentTimeshare(tokenId);
    var underlyingMetadata = await axios.get(underlyingTokenURI);
    if (underlyingMetadata.status !== 200) {
      res.send("Error in underlying NFT's metadata " + JSON.stringify(underlyingMetadata));
      return;
    }
    underlyingMetadata = underlyingMetadata.data

    if (!underlyingMetadata.attributes) {
      underlyingMetadata.attributes = [];
    }
    if (!underlyingMetadata.name) {
      underlyingMetadata.name = "";
    }
    if (!underlyingMetadata.description) {
      underlyingMetadata.description = "";
    }

    underlyingMetadata.attributes.push({
      trait_type: "Month",
      value     : monthStr
    });
    underlyingMetadata.attributes.push({
      trait_type: "Parent Timeshare TokenId",
      value     : parentId.toString()
    });
    underlyingMetadata.name = underlyingMetadata.name + " -- " + monthStr.toUpperCase();
    underlyingMetadata.description = underlyingMetadata.description +
        "  This NFT represents ownership for the month of " + monthStr + ". "
        + "Learn more at www.nftimeshares.fun";

    res.json(underlyingMetadata);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

app.get('/timeshare/:token_id', async function(req, res) {
  const tokenId = parseInt(req.params.token_id);
  const timeshareMonthIds  = await nftimesharemonth.getTimeshareMonths(tokenId);
  const underlyingTokenURI = await nftimeshare.underlyingTokenURI(tokenId);
  var   underlyingMetadata = await axios.get(underlyingTokenURI);
  if (underlyingMetadata.status !== 200) {
    res.send("Error in underlying NFT's metadata " + JSON.stringify(underlyingMetadata));
    return;
  }
  underlyingMetadata = underlyingMetadata.data;
  if (!underlyingMetadata.attributes) {
    underlyingMetadata.attributes = []
  }
  underlyingMetadata.attributes.push({
    trait_type: "Ownership",
    value     : "Timeshared"
  })
  underlyingMetadata.attributes.push({
    trait_type: "Timeshare Months",
    value      : timeshareMonthIds.map(id => {return id.toString()}).join(', ')
  })
  res.json(underlyingMetadata);
})

app.get('/api/test', async function(req,res) {
  console.log("hit /api/test backend");
  res.send("nice");
})

app.get('/api/ownednfts/:owner/:pagination_token?', async function (req, res) {
  const ownerAddr = parseInt(req.params.owner);
});

app.get('/api/ownedtimesharemonths/:owner', async function (req, res) {
  const ownerAddr = req.params.owner;
  console.log("Backend with " + ownerAddr);
  if (!ownerAddr) {
    res.send("Error: no owner specified in request to /ownedtimesharemonths api");
  }
  var balance = await nftimesharemonth.balanceOf(ownerAddr);
  var tokens = [];
  for (let i = 0 ; i < Math.min(balance, 20); i++ ) {
    var token = await nftimesharemonth.tokenOfOwnerByIndex(ownerAddr, i);
    console.log(token);
    tokens.push(token);
  }
  res.json({tokens});
});

app.get('/api/alltimesharemonths', async function (req, res) {
  try {
    var supply = await nftimesharemonth.totalSupply();
    var tokens = [];
    for (let i = 0; i < Math.min(supply, 25); i++) {
      var token = await nftimesharemonth.tokenByIndex(i);
      console.log(token);
      var month = await nftimesharemonth.month(token.toString());
      console.log(month);
      var url   = await nftimesharemonth.tokenURI(token.toString());
      console.log(url);
      var metadata = await axios.get(urlify(url));
      console.log(metadata);
      var media;
      var name;
      if (metadata.status == 200 && metadata.data) {
        media = metadata.data.image || metadata.data.image_data || metadata.animation_url || metadata.youtube_url;
        name = metadata.data.name;
      }
      tokens.push([{
        id: token.toString(),
        month: month.toString(),
        media: media.toString(),
        name: name.toString()
      }]);
    }
    res.json(tokens);
  } catch (error) {
    console.log(error);
  }
});


app.use(express.static("../dapp/public"));
app.get('/*', function (req, res) {
  //res.sendFile(path.join(__dirname, "../dapp/build", "index.html"));
  res.sendFile(path.join(__dirname, "../dapp/public", "index.html"));
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})


function monthName(month) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
  return monthNames[month]
}

function urlify(url) {
  //TODO check if it's ipfs:// vs http[s]://
  return url;
}

async function setupContracts() {
  provider = new ethers.providers.AlchemyProvider("rinkeby", alchemyKeyOnly);
  nftimeshare = new ethers.Contract(
    contractAddress.NFTimeshare,
    NFTimeshareArtifact.abi,
    provider
  );
  nftimesharemonth = new ethers.Contract(
    contractAddress.NFTimeshareMonth,
    NFTimeshareMonthArtifact.abi,
    provider
  );
}
