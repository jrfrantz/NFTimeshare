const express = require('express')
const path = require('path')
const { ethers } = require("ethers");
const axios = require('axios');
//const enforce = require('express-sslify');
const PORT = process.env.PORT || 5000
const RINKEBY_ALCHEMY_KEY_ONLY = process.env.RINKEBY_ALCHEMY_KEY || require('../secrets.json').rinkeby.RINKEBY_ALCHEMY_KEY_ONLY;
const ALCHEMY_KEY_ONLY = process.env.ALCHEMY_KEY || require('../secrets.json').mainnet.ALCHEMY_KEY_ONLY
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY || require('../secrets.json').mainnet.OPENSEA_API_KEY;
const PROD_NFTIMESHARES_WALLET_ADDR = process.env.PROD_NFTIMESHARES_WALLET_ADDR || require('../secrets.json').mainnet.PROD_NFTIMESHARES_WALLET_ADDR
const NFTimeshareArtifact      = require("./src/contracts/NFTimeshare.json");
const NFTimeshareMonthArtifact = require("./src/contracts/NFTimeshareMonth.json");
const contractAddress          = require("./src/contracts/contract-address.json");
const SPECIAL_NFT_CONTRACTS    = ["0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7".toLowerCase()]
let provider, nftimeshare, nftimesharemonth;
let zoracontract; // special case contract

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
//app.use(enforce.HTTPS({ trustProtoHeader: true }))

const OPENSEA_HEADER = {headers: {'X-API-KEY': OPENSEA_API_KEY}};

setupContracts();

/**
 * METADATA METHODS
 */
app.get('/timeshareprojectmetadata', function(req,res) {
  res.json({
    "name": "NFTimeshares",
    "description": "Turn any Ethereum ERC721 NFT into a Timeshare. Deposit an NFT to receive 12 timeshares of that NFT -- one for each month. Redeem the original NFT by giving back 12 timeshares of that NFT. Tokens from this contract represent the underlying (deposited) NFT.",
    "image": "http://www.nftimeshares.fun/logo.png",
    "external_link": "http://www.nftimeshares.fun",
    "seller_fee_basis_points": 0,
    "fee_recipient": "0x0000000000000000000000000000000000000000"
  })
});
app.get('/timesharemonthprojectmetadata', function(req,res) {
  res.json({
    "name": "NFTimeshares",
    "description": "Turn any Ethereum ERC721 NFT into a Timeshare. Deposit an NFT to receive 12 timeshares of that NFT -- one for each month. Redeem the original NFT by giving back 12 timeshares of that NFT. Tokens from this contract represent ownership of one month of a timeshared NFT.",
    "image": "http://www.nftimeshares.fun/logo.png",
    "external_link": "http://www.nftimeshares.fun",
    "seller_fee_basis_points": 0,
    "fee_recipient": "0x0000000000000000000000000000000000000000"
  })
});
// need one for timeshare and one for timesharemonth
app.get('/timesharemonth/:token_id', async function(req, res) {
  // 1/ get parent nft's tokenId for this timeshare
  // 2/ (contract, tokenId) = wrappedNFT (tokenId)
  // 3/ call and read URI of underlying
  try {
    const tokenId = req.params.token_id;
    console.log(tokenId);
    var [underlyingTokenURI,
      monthStr,
      parentId] = await Promise.all([
        nftimesharemonth.underlyingTokenURI(tokenId),
        nftimesharemonth.month(tokenId),
        nftimesharemonth.getParentTimeshare(tokenId),
      ]);
    monthStr = monthName(monthStr);

    var [underlying_contract, underlying_tokenId] = await nftimeshare.getWrappedNFT(parentId);

    let underlyingSpecialCaseImage;
    if (SPECIAL_NFT_CONTRACTS.includes(underlying_contract.toLowerCase())) {
      // zora represents their calls weird.
      [underlyingTokenURI, underlyingSpecialCaseImage] = await Promise.all([
        zoracontract.tokenMetadataURI(underlying_tokenId),
        zoracontract.tokenURI(underlying_tokenId)
      ]);
    }

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

    if (underlyingSpecialCaseImage) {
      underlyingMetadata.media = underlyingSpecialCaseImage;
      underlyingMetadata.image = underlyingSpecialCaseImage;
      underlyingMetadata.image_url = underlyingSpecialCaseImage
    }
    res.json(underlyingMetadata);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

app.get('/timeshare/:token_id', async function(req, res) {
  const tokenId = req.params.token_id;
  console.log("requested tokenid", tokenId);
  let [timeshareMonthIds, 
        underlyingTokenURI,
        [underlying_contract, underlying_tokenId]] = await Promise.all([
    nftimesharemonth.getTimeshareMonths(tokenId),
    nftimeshare.underlyingTokenURI(tokenId),
    nftimeshare.getWrappedNFT(tokenId)
  ])
  
  let underlyingSpecialCaseImage;
  if (SPECIAL_NFT_CONTRACTS.includes(underlying_contract.toLowerCase())) {
    // fuck zora, which separates tokenURI (image) from tokenMetadataURI (json)
    [underlyingTokenURI, underlyingSpecialCaseImage] = await Promise.all([
      zoracontract.tokenMetadataURI(underlying_tokenId),
      zoracontract.tokenURI(underlying_tokenId)]);
  }
  var underlyingMetadata = await axios.get(underlyingTokenURI);

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

  underlyingMetadata.name = underlyingMetadata.name + " 🗓🌞Timeshare⛷🗓";
  underlyingMetadata.description = underlyingMetadata.description +
      " This NFT is wrapped under timeshare. "
      + "Learn more at www.nftimeshares.fun";

  if (underlyingSpecialCaseImage) {
    underlyingMetadata.media = underlyingSpecialCaseImage;
    underlyingMetadata.image = underlyingSpecialCaseImage;
    underlyingMetadata.image_url = underlyingSpecialCaseImage
  }
  res.json(underlyingMetadata);
})

app.get('/api/test', async function(req,res) {
  console.log("hit /api/test backend");
  res.send("nice");
})
/**
 * API METHODS
 */
// DEPOSITABLE
app.get('/api/ownednfts/:owner/:offset?', async function (req, res) {
  try {
    const ownerAddr = req.params.owner;
    const offset = req.params.offset ? parseInt(req.params.offset) : 0;
    const OWNED_ASSETS_URL = `https://api.opensea.io/api/v1/assets?owner=${ownerAddr}&order_direction=desc&offset=${offset}&limit=21`;
    axios.get(OWNED_ASSETS_URL, OPENSEA_HEADER).then(function(response) {
      if (response.status !== 200) {
        res.send("Error in response from Opensea: ", response);
      }

      var assets = response.data.assets;
      const nextOffset = assets.length > 20 ? offset + 20 : -1;
      console.log("opensea says", assets.length);
      assets = assets.filter((nft) =>
        (nft.asset_contract.address.toLowerCase() !==
        contractAddress.NFTimeshareMonth.toLowerCase())
        && (nft.asset_contract.address.toLowerCase() !==
          contractAddress.NFTimeshare.toLowerCase())
      );
      assets = assets.map(function (nft)  {
        nft.name = nft.name  || `Token ${nft.token_id} from contract at ${nft.asset_contract.address}`;
        //nft.media = nft.media || nft.image_url || nft.image || nft.image_data || nft.animation_url || nft.youtube_url;
        nft.media = nft.image_url; // TODO urlify?
        nft.external_contract = nft.asset_contract.address
        return nft;
      });
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

// REDEEMABLE
app.get('/api/ownedtimesharemonths/:owner/:offset?', async function (req, res) {
  const ownerAddr = req.params.owner;
  const offset = req.params.offset ? parseInt(req.params.offset) : 1; // TokenIDs start at 1
  console.log("Owned timesharemonths " + ownerAddr + ", " + req.params.offset);
  if (!ownerAddr) {
    res.json("Error: no owner specified in request to /ownedtimesharemonths api");
  }
  var tokens = await nftimesharemonth.tokensOf(ownerAddr, offset, 21);
  var nextOffset = tokens.length > 20 ? offset + 20 : -1;
  tokens = tokens.slice(0,20).map(({tokenId, month, tokenURI}) => {
    return {
      token_id: tokenId.toString(),
      month: monthName(month),
      metadataURL: tokenURI,
      permalink: `https://opensea.io/assets/${contractAddress.NFTimeshareMonth}/${tokenId.toString()}`,
      req: axios.get(urlify(tokenURI))
    }});
  Promise.all(tokens.map((token) => token.req))
    .then(function (results) {
      //console.log("Axios returned ", results);
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
        nextOffset: nextOffset
      });
    });
  });

  app.get('/api/alltimeshares/:offset?', async function (req, res) {
    const offset = req.params.offset ? parseInt(req.params.offset) : 0;
    const ALL_NFTIMESHARES_URL = `https://api.opensea.io/api/v1/assets?asset_contract_address=${contractAddress.NFTimeshare.toLowerCase()}&order_by=token_id&order_direction=desc&offset=${offset}&limit=21`;
    console.log(ALL_NFTIMESHARES_URL);
    const MOCK_FOUNDATION_URL = `https://api.opensea.io/api/v1/assets?asset_contract_address=0x3B3ee1931Dc30C1957379FAc9aba94D1C48a5405&order_direction=desc&offset=${offset}&limit=21`;
    axios.get(ALL_NFTIMESHARES_URL, OPENSEA_HEADER).then(function(response) {
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
      res.json({
        nfts: assets.slice(0,20),
        nextOffset: nextOffset
      });
    }).catch((error) => {
    });
  });

// for homescreen
app.get('/api/alltimesharemonths/:offset?', async function (req, res) {
  const offset = req.params.offset ? parseInt(req.params.offset) : 0;
  const ALL_NFTIMESHARES_URL = `https://api.opensea.io/api/v1/assets?asset_contract_address=${contractAddress.NFTimeshareMonth.toLowerCase()}&order_by=token_id&order_direction=desc&offset=${offset}&limit=21`;
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
// for homepage's modal
app.get('/api/monthTokensForTimeshare/:timeshareTokenId', async function (req, res) {
  var monthIds = await nftimesharemonth.getTimeshareMonths(req.params.timeshareTokenId);
  console.log(monthIds);
  var monthLinks = monthIds.map((monthTokenId, i) => {
    return {
      asset_url: `https://opensea.io/assets/${nftimesharemonth.address}/${monthTokenId}`,
      month    :  monthName(i)
    }
  });
  res.json({
    nfts: [...monthLinks],
  });
});

app.use(express.static(path.join(__dirname, "..", "dapp/build")));
//app.use(express.static("../dapp/public"));
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
  provider = new ethers.providers.AlchemyProvider("homestead", ALCHEMY_KEY_ONLY);
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
  zoracontract = new ethers.Contract(
    "0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7",
    ["function tokenMetadataURI(uint256) view returns (string)",
    "function tokenURI(uint256) view returns (string)"],
    provider
  )
}
