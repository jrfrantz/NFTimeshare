import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import SmoothScroll from 'smooth-scroll'
import contractAddress from "../contracts/contract-address.json"

import { NFTCardDeck } from '../components2/nftcarddeck';
import { TimeshareJumbotron } from "../components2/timesharejumbotron";
import { HowItWorks } from "../components2/howitworks";
import { Credits } from "../components2/credits";
import axios from 'axios'



// some junk imports for testing
import TestNFTArtifact from "../contracts/TestNFT.json"
import { Button } from "react-bootstrap"

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
})
const Home = () => {
  const [address, setAddress] = useState("");
  const [testNFT, setTestNFT] = useState({});
  const [publicTimeshares, setPublicTimeshares] = useState([])
  const [loadingState, setLoadingState] = useState({isLoading:false, hasMore:false, page:1})



  const loadMoreTimeshareMonths = () => {
    setLoadingState((prevstate) => {
      return {
        ...prevstate,
        isLoading: true
      }
    })
    axios.get('/api/alltimesharemonths').then(function (response) {
      console.log("alltimesharemonths responded with", response);
      if (response.status != 200 || !response.data) {
        console.log("Bad response from server", response);
        return;
      }
      setPublicTimeshares((oldtimeshares) => {

        return [...oldtimeshares, ...response.data]
      });
      setLoadingState((prevstate) => {
        return {
          isLoading: false,
          hasMore:(response.data.length > 20),
          page:prevstate.page+1
        }
      })
    }).catch(function (error) {
      console.error(error);
    })
  }

  useEffect(() => {
    loadMoreTimeshareMonths()
  }, []);

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      console.log("Account changed to ", newAddress);
      setAddress(newAddress);
    })
  }, [])


  const connectWallet = async () => {
    const [selectedAddress] = await window.ethereum.enable();
    setAddress(selectedAddress);
    let prov = new ethers.providers.Web3Provider(window.ethereum);
    let tNFT = new ethers.Contract(
      contractAddress.TestNFT,
      TestNFTArtifact.abi,
      prov.getSigner(0)
    );
    console.log()
    setTestNFT(tNFT);
  }



  return (
    <div>
      <TimeshareJumbotron />
      <HowItWorks />
    <hr />
  <NFTCardDeck nfts={publicTimeshares} loadingState={loadingState} />
<Button variant='outline-secondary' onClick={loadMoreTimeshareMonths}>Load more</Button>
    {false && testNFT && <Button onClick={() => connectWallet()}>CNECT NFT</Button>}
    {false && testNFT && <Button onClick={() => testNFT.awardTestNFT()}>Award Test NFT</Button>}
    <Credits />
    </div>
  )
}

export default Home
