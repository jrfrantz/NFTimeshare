import { useState, useEffect } from 'react'
import { Explainer } from '../components/explainer'
import { Redeemable } from '../components/redeemable'
import { Depositable } from '../components/depositable'
import JsonData from '../data/nft_data.json'
import SmoothScroll from 'smooth-scroll'
import { Modal } from '../components/modal'
import axios from 'axios'
import { ethers } from 'ethers'
import contractAddress from "../contracts/contract-address.json"
import TestNFTArtifact from "../contracts/TestNFT.json"
import NFTimeshareArtifact from "../contracts/NFTimeshare.json"
import NFTimeshareMonthArtifact from "../contracts/NFTimeshareMonth.json"
import { ConnectWallet } from '../components/connectwallet'
import ERC721abi from "../contracts/ERC721abi.json"
export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
})

const GetStarted = () => {
  const [nftData, setNftData] = useState({})
  const [address, setAddress] = useState("");
  const [modalState, setModalState] = useState(null);
  const [ownedNFTs, setOwnedNFTs] = useState({});
  const [ownedTimeshares, setOwnedTimeshares] = useState({});
  const [nftimeshare, setNftimeshare] = useState({});
  const [nftimesharemonth, setNftimesharemonth] = useState({});

  useEffect(() => {
    if (!address) {
      return;
    }
    const ownedNFTsURL = 'https://rinkeby-api.opensea.io/api/v1/assets?owner='
                + address
                + '&order_direction=desc&offset=0&limit=20';
    axios.get(ownedNFTsURL).then(function (response) {
      console.log("before filter", response.data.assets);
      setOwnedNFTs(
        {
          'nfts': [
            ...response.data.assets
          ].filter((asset) => asset.asset_contract.address.toLowerCase() !== contractAddress.NFTimeshareMonth.toLowerCase())
        }
      );
      console.log("after filter", ownedNFTs);
    });
  }, [address]);
  useEffect(() => {
    if (!address) {
      return;
    }
    const ownedNFTimeshareMonthsURL = 'https://rinkeby-api.opensea.io/api/v1/assets?owner='
                  + address
                  + '&asset_contract_address=' + contractAddress.NFTimeshareMonth.toLowerCase()
                  + '&order_direction=desc&offset=0&limit=20';
    axios.get(ownedNFTimeshareMonthsURL).then(function (response) {
      setOwnedTimeshares({
        'nfts': [
          ...response.data.assets
        ]
      });
    });
  }, [address]);
  useEffect(() => {
    if (!window.ethereum) {
      return;
    }
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      console.log("Account changed to ", newAddress);
      setAddress(newAddress);
    })
  }, []);

  const connectWallet = async () => {
    const [selectedAddress] = await window.ethereum.enable();
    console.log(selectedAddress);

    let prov = new ethers.providers.Web3Provider(window.ethereum);
    let tTimeshareMonth = new ethers.Contract(
      contractAddress.NFTimeshareMonth,
      NFTimeshareMonthArtifact.abi,
      prov.getSigner(0)
    );
    let tTimeshare  = new ethers.Contract(
      contractAddress.NFTimeshare,
      NFTimeshareArtifact.abi,
      prov.getSigner(0)
    );
    setAddress(selectedAddress);
    setNftimeshare(tTimeshare);
    setNftimesharemonth(tTimeshareMonth);
  };

  function onClickNft(nft) {
    console.log('hey: ', nft);
    setModalState({nft});
  }
  function onClickDepositableNft(nft) {
    onClickNft({action: "deposit", ...nft})
  }
  function onClickRedeemableNft(nft) {
    onClickNft({action: "redeem", ...nft})
  }

  function onCloseModal() {
    setModalState(null);
  }

  // should be triggered when someone presses Lets do it the modal
  async function depositNft(externalContract, externalTokenId) {
    console.log("depositing");
    console.log("contract, token: ", externalContract, externalTokenId);
    console.log(new ethers.providers.Web3Provider(window.ethereum).getSigner(0));
    let erc721Contract = new ethers.Contract(
      externalContract,
      ERC721abi.interface,
      new ethers.providers.Web3Provider(window.ethereum).getSigner(0)
    );
    await erc721Contract.setApprovalForAll(contractAddress.NFTimeshare, true);
    await nftimeshare.deposit(
      externalContract,
      externalTokenId,
      address,
      address
    );
    console.log("deposited asset");
  }

  // should be triggered when someone presses redeem in the modal on any timesharemonth
  async function redeemNft(timeshareMonthTokenId) {
    console.log("redeeming");
    let parentTokenId = await nftimesharemonth.getParentTimeshare(timeshareMonthTokenId);
    console.log("parent token id is ", parentTokenId);
    await nftimeshare.redeem(parentTokenId, address);
  }

// not used
  function getNftData() {
    if (!nftData.nfts) {
      return null;
    }
    return nftData.nfts.map(nft => {
      return {
        clickImageUrl: `https://opensea.io/assets/${nft.contractAddr}/${nft.tokenId}`,
        //onClickButton: () => onClickNft(nft),
        buttonText: "Deposit",
        ...nft,
      };
    });
  }


  function getOwnedNFTData() {
    console.log(ownedNFTs);
    if (!ownedNFTs.nfts) {
      console.log("no owned nftdata");
      return null;
    }
    return ownedNFTs.nfts.map(nft => {
      return {
        img: nft.image_thumbnail_url,
        tokenId: nft.token_id,
        contractAddr: nft.asset_contract.address,
        name: nft.name,
        buttonText: "Deposit",
        onClickButton: () => onClickDepositableNft(nft),
        // clickImageUrl: pop the modal or nft.permalink to opensea
        ...nft,
      };
    });
  }

  function getTimeshareData(){
    console.log(ownedTimeshares);
    if(!ownedTimeshares.nfts) {
      return null;
    }
    return ownedTimeshares.nfts.map(nft => {
      return {
        img: nft.image_thumbnail_url,
        tokenId: nft.token_id,
        contractAddr: nft.asset_contract.address,
        name: nft.name,
        buttonText: "Redeem",
        onClickButton: () => onClickRedeemableNft(nft),
        ...nft,
      };
    });
  }

  return (
    <div>
      <Modal modalState={modalState} closeModal={onCloseModal}
              depositFunc={depositNft} redeemFunc={redeemNft}/>
      <Explainer />
      <ConnectWallet connectedWallet={address} connectFunc={() => connectWallet()}/>
      <Depositable nfts={getOwnedNFTData()}/>
      <Redeemable nfts={getTimeshareData()} />
    </div>
  )
}

export default GetStarted
