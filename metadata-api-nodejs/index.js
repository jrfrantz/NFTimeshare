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
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY || require('../secrets.json').OPENSEA_API_KEY;
const PROD_NFTIMESHARES_WALLET_ADDR = process.env.PROD_NFTIMESHARES_WALLET_ADDR || require('../secrets.json').PROD_NFTIMESHARES_WALLET_ADDR
const NFTimeshareArtifact      = require("./src/contracts/NFTimeshare.json");
const NFTimeshareMonthArtifact = require("./src/contracts/NFTimeshareMonth.json");
const contractAddress          = require("./src/contracts/contract-address.json");
let provider, nftimeshare, nftimesharemonth;

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

const OPENSEA_HEADER = {headers: {'X-API-KEY': OPENSEA_API_KEY}};
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


// need one for timeshare and one for timesharemonth
app.get('/timesharemonth/:token_id', async function(req, res) {
  // 1/ get parent nft's tokenId for this timeshare
  // 2/ (contract, tokenId) = wrappedNFT (tokenId)
  // 3/ call and read URI of underlying
  try {
    const tokenId = req.params.token_id;
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
    underlyingMetadata.name = underlyingMetadata.name + " (" + monthStr + ")";
    underlyingMetadata.description = underlyingMetadata.description +
        " [NFT Timeshare] This NFT represents ownership for the month of " + monthStr + ". "
        + "Learn more at www.nftimeshares.fun";

    res.json(underlyingMetadata);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

app.get('/timeshare/:token_id', async function(req, res) {
  const tokenId = req.params.token_id;
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

// to deposit
app.get('/api/ownednfts/:owner/:offset?', async function (req, res) {
  console.log('reached api ownednfts', req.params);
  try {
    const ownerAddr = req.params.owner;
    const offset = req.params.offset ? parseInt(req.params.offset) : 0;
    const OWNED_ASSETS_URL = `https://rinkeby-api.opensea.io/api/v1/assets?owner=${ownerAddr}&order_direction=desc&offset=${offset}&limit=21`;
    axios.get(OWNED_ASSETS_URL, OPENSEA_HEADER).then(function(response) {
      if (response.status !== 200) {
        res.send("Error in response from Opensea: ", response);
      }

      var assets = response.data.assets;
      const nextOffset = assets.length > 20 ? offset + 20 : -1;
      console.log("opensea says", assets.length);
      assets = assets.filter((nft) =>
        nft.asset_contract.address.toLowerCase() !==
        contractAddress.NFTimeshareMonth.toLowerCase()
      );
      console.log('after filter', assets.length);
      assets = assets.map(function (nft)  {
        nft.name = nft.name  || `Token ${nft.token_id} from contract at ${nft.asset_contract.address}`;
        //nft.media = nft.media || nft.image_url || nft.image || nft.image_data || nft.animation_url || nft.youtube_url;
        nft.media = nft.image_url; // TODO urlify?
        nft.external_contract = nft.asset_contract.address
        return nft;
      });
      console.log('after second map', assets.length);
      res.json({
        nfts: assets.slice(0,20),
        nextOffset: nextOffset
      });
    }).catch((error) => {
      console.log("Error in opensea call", error);
      res.json(error);
    });
  } catch (error) {
    console.log("Error is ", error);
    res.json(error);
  }
});

// to redeem
app.get('/api/ownedtimesharemonths/:owner/:offset?', async function (req, res) {
  const ownerAddr = req.params.owner;
  const offset = req.params.offset ? parseInt(req.params.offset) : 0;
  console.log("Owned timesharemonths " + ownerAddr + ", " + req.params.offset);
  if (!ownerAddr) {
    res.json("Error: no owner specified in request to /ownedtimesharemonths api");
  }
  var tokens = await nftimesharemonth.tokensOf(ownerAddr);
  tokens = tokens.map(({tokenId, month, tokenURI}) => {
    return {
      token_id: tokenId.toString(),
      month: monthName(month),
      metadataURL: tokenURI,
      req: axios.get(urlify(tokenURI))
    }});
  Promise.all(tokens.map((token) => token.req))
    .then(function (results) {
      results.forEach( (metadata, index) => {
        var media;
        var name;
        if (metadata.status === 200 && metadata.data) {
          media = metadata.data.image || metadata.data.image_url || metadata.data.image_data || metadata.animation_url || metadata.youtube_url;
          name  = metadata.data.name;
        }
        tokens[index].media = media ? media.toString() : null;
        tokens[index].name = name.toString();
      });
      res.json({
        nfts: tokens,
        nextOffset: -1
      });
    });

  /*
  var balance = await nftimesharemonth.balanceOf(ownerAddr);
  var tokens = [];
  for (let i = offset ; i < Math.min(balance, offset+21); i++ ) {
    var token = await nftimesharemonth.tokenOfOwnerByIndex(ownerAddr, i);
    var month = await nftimesharemonth.month(token.toString());
    var url   = await nftimesharemonth.tokenURI(token.toString());
    var metadata = await axios.get(urlify(url));

    tokens.push({
      token_id: token.toString(),
      month: monthName(month),
      media: media ? media.toString() : null,
      name: name.toString()
    });
  }
  var nextOffset = (offset+20 < balance) ? offset+20 : -1;
  res.json({
    nfts: tokens.slice(0,20),
    nextOffset: nextOffset
  });*/
});

// for homescreen
app.get('/api/alltimesharemonths/:offset?', async function (req, res) {
  const offset = req.params.offset ? parseInt(req.params.offset) : 0;
  const ALL_NFTIMESHARES_URL = `https://rinkeby-api.opensea.io/api/v1/assets?asset_contract_address=${contractAddress.NFTimeshareMonth.toLowerCase()}&order_by=token_id&order_direction=desc&offset=${offset}&limit=21`;
  console.log(ALL_NFTIMESHARES_URL);
  const MOCK_FOUNDATION_URL = `https://api.opensea.io/api/v1/assets?asset_contract_address=0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405&order_direction=desc&offset=${offset}&limit=21`;
  axios.get(MOCK_FOUNDATION_URL, OPENSEA_HEADER).then(function(response) {
    if (response.status !== 200) {
      res.json(response);
      return;
    }

    var assets = response.data.assets;
    const nextOffset = assets.length > 20 ? offset+20 : -1;
    assets = assets
      .filter((nft) => {return nft.owner.address !== "0x0000000000000000000000000000000000000000"})
      .map((nft) => {
        if (!nft.image_url) {
          console.log(nft);
        }
        nft.name = nft.name  || `Token ${nft.token_id} from contract at ${nft.asset_contract.address}`;
        //nft.media = nft.media || nft.image || nft.image_url || nft.image_data || nft.animation_url || nft.youtube_url;
        nft.media = nft.image_url;
        var monthTrait = nft.traits.find((trait) => {
          return trait.trait_type === "Month"
        });
        nft.permalink = nft.permalink ? (nft.permalink+`?ref=${PROD_NFTIMESHARES_WALLET_ADDR}`) : ""
        nft.month = monthTrait ? monthTrait.value : "";
        return nft;
    });
    console.log("about to send json with ", assets, nextOffset);
    res.json({
      nfts: assets.slice(0,20),
      nextOffset: nextOffset
    });
  }).catch((error) => {
  });
});

app.use(express.static(path.join(__dirname, "..", "dapp/build")));
app.use(express.static("../dapp/public"));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, "../dapp/build", "index.html"));
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
