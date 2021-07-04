import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Header } from '../components/header'
import { Pitch } from '../components/pitch'
import { ConnectWallet } from '../components/connectwallet'
import { AwardTestNFTButton } from "../components/awardtestnftbutton"
import JsonData from '../data/home_data.json'
import SmoothScroll from 'smooth-scroll'
import contractAddress from "../contracts/contract-address.json"
import TestNFTArtifact from "../contracts/TestNFT.json"
import { NFTimesharesBrowsable } from "../components/nftimesharesbrowsable"
import axios from 'axios'
export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
})

const Home = () => {
  const [landingPageData, setLandingPageData] = useState({})
  const [address, setAddress] = useState("");
  const [viewerSupply, setViewerSupply] = useState(-1);
  const [testNFT, setTestNFT] = useState({});
  const [publicTimeshares, setPublicTimeshares] = useState({})

  useEffect(() => {
    const timesharesURL = 'https://rinkeby-api.opensea.io/api/v1/assets?asset_contract_address='
              + contractAddress.NFTimeshareMonth.toLowerCase()
              + '&order_direction=desc&offset=0&limit=20';
    axios.get(timesharesURL).then(function (response) {
      setPublicTimeshares({'nfts' : [...response.data.assets]})
    });
  }, []);

  useEffect(() => {
    setLandingPageData(JsonData)
    if (!window.ethereum) {
      return;
    }
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      console.log("Account changed to ", newAddress);
      setAddress(newAddress);
    })
  }, [])

  useEffect(() =>  {
    async function fetchData() {
      if (testNFT && Object.keys(testNFT).length == 0) {
        console.log("null is ", testNFT, Object.keys(testNFT).length);
        return;
      }
      var vSupply = await testNFT.balanceOf(address);
      setViewerSupply(vSupply.toString());
    }
    fetchData();
  }, [testNFT]);


  const connectWallet = async () => {
    const [selectedAddress] = await window.ethereum.enable();
    setAddress(selectedAddress);
    let prov = new ethers.providers.Web3Provider(window.ethereum);
    let tNFT = new ethers.Contract(
      contractAddress.TestNFT,
      TestNFTArtifact.abi,
      prov.getSigner(0)
    );
    setTestNFT(tNFT);
  }

  function getNFTimeshares() {
    if (!publicTimeshares.nfts) {
      return null;
    }
    return publicTimeshares.nfts.map(nft => {
      return {
        img: nft.image_thumbnail_url,
        tokenId: nft.token_id,
        contractAddr: nft.asset_contract.address,
        name: nft.name,
        ...nft,
      }
    });
  }
  return (
    <div>
      <Header data={landingPageData.Header} />
      <Pitch data={landingPageData.Pitch} />
      <NFTimesharesBrowsable nfts={getNFTimeshares()} />
      <AwardTestNFTButton contract={testNFT} />
      <p>You have {viewerSupply ===-1 ? "no" : viewerSupply} Test NFTs</p>
    </div>
  )
}

export default Home
