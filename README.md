# NFTimeshares

NFTimeshares is a protocol for sharing ownership of an NFT via a Timeshare.
You can deposit an ERC721 NFT, and get back 12 NFTs in return – one for each month of
the year. Each month is a normal ERC721 that can be bought, sold, and traded.
You can redeem the underlying "original" NFT if you give back all 12 Timeshares.

## Contract Architecture
There are two smart contracts: `NFTimeshare`, which is 1:1 with the input NFT
and acts as a "parent token" to the second contract, `NFTimeshareMonth`,
which is an ERC721 Token representing ownership of a single month of a given asset.

## Matching Months to NFTs & Timeshare Metadata
__From a `NFTimeshareMonth` token:__ If you own an `NFTimeshareMonth`, you can see which month is associated with it by
1. Calling `month(tokenId)`, which returns a number between 0 (Jan) and 11 (Dec)
2. Accessing the metadata `tokenURI(tokenId)`, which returns the same metadata
as the underlying NFT with two added `attributes` fields: `{trait_type: "Month", value:"January"}`
and `{trait_type: "Parent Timeshare Id", value: "..."}`

__From an `NFTimeshare` parent object:__ With an NFTimeshare tokenId, calling `ownerOf(tokenId)` will return the address of whomever owns the `NFTimeshareMonth`
for whatever month it is now, according to the blockchain.

__From the underlying NFT__: If you only know the info about the underlying timeshared asset (for example, maybe you're a video game and looking for the current owner of
an in-game power-up), you can use getter method `getTokenIdForUnderlyingNFT(your_nft_contract_address, your_nft_token_id)`. Then use the above :)

Example metadata:
```
// For parent Timeshare asset wrapper
GET 'http://www.nftimeshares.fun/timeshare/tokenId'
//eg http://www.nftimeshares.fun/timeshare/42
=>
{
    image: "http:// underlying asset.png" // pulled from underlying asset
    ...                                   // everything from underlying asset
    attributes:[
      {
        trait_type :"Ownership",
        value      :"Timeshared"
      },
      {
        trait_type:"Timeshare Months",
        value:"493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504" // 12 tokenIDs of TimeshareMonths
      },
      ... // whatever other attributes were in the underlying token
    ]
}


// For TimeshareMonths
GET 'http://www.nftimeshares.fun/timesharemonth/tokenId'
//eg http://www.nftimeshares.fun/timesharemonth/493
=>
{
    image: "http:// underlying asset.png" // pulled from same underlying asset
    ...                                   // everything from underlying asset
    attributes:[
      {
        trait_type:"Month",
        value:"January" // tokenId 493 corresponds to the January month for
      },
      {
        trait_type:"Parent Timeshare TokenId",
        value:"42" // reference to parent Timeshare
      },
      ... // whatever other attributes were in the underlying token
    ]
}
```

## Contract Addresses
On Rinkeby:
- NFTimeshare address: `0xe4aA8DE6adea71Aab6db1dEB2a34afDCc19ce295`
- NFTimeshareMonth address: `0x1909E978C0d4BC90D93bbD1CC367297d2bea1b2F`

On Mainnet:
- tk :)

## Interacting with `NFTimeshare` and `NFTimeshareMonth`
Want to make a timeshare? It's as easy as getting your NFT ready, and:
```
NFTimeshare.deposit(NFTContractAddress, NFTTokenId, OwnerAddress, RecipientAddress);
// NFTimeshare is now wrapping the input NFT that used to
// belong to OwnerAddress, and Recipient owns 12 NFTimeshareMonths
```
Most of the time probably the `Recipient` will just be the same as `Owner`, but
it's provided as an option for flexibility.

Do you own the whole year's worth of `NFTimeshareMonths` for an asset? You can
get back the original asset by simply:
```
NFTimeshare.redeem(tokenId, RecipientAddress)
```



## `TODO`, Feedback, Bugs, Issues
The smart contracts are not audited, and this project doesn't make any money.
Please disclose bugs and vulnerabilities. Pull requests will be reviewed an ad-hoc
basis.

You can build this project with `git clone`, `npm install`.

For contracts `/contracts`:
```
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js // or scripts/deployUpgrades.js
```

For the dapp, from two different terminal windows
```
npm run server # from terminal window 1
npm run client # from terminal window 2
```

The metadata server (which is used by opensea and others) is in `/metadata-api-nodejs`
and the frontend is in `/dapp`
