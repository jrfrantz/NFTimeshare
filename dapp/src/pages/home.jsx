import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import SmoothScroll from 'smooth-scroll'
import contractAddress from "../contracts/contract-address.json"

import { NFTCardDeck } from '../components2/nftcarddeck';
import { TimeshareJumbotron } from "../components2/timesharejumbotron";
import { HowItWorks } from "../components2/howitworks";
import { Credits } from "../components2/credits";
import { ChooseMonth } from '../components2/choosemonth'
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
  const [publicTimesharesOffset, setPublicTimesharesOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false)


  const loadMoreTimeshareMonths = () => {
    const ALL_TIMESHARES_API = `/api/alltimesharemonths/${publicTimesharesOffset}`;
    setIsLoading(true);
    axios.get(ALL_TIMESHARES_API).then(function (response) {
      if (response.status != 200 || !response.data) {
        console.log("Bad response from server", response);
      }
      setPublicTimeshares((oldtimeshares) => [...oldtimeshares, ...response.data.nfts]);
      setPublicTimesharesOffset(response.data.nextOffset);

    }).catch(function (error) {
      console.error(error);
    }).finally(() => {
      setIsLoading(false);
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
      <ChooseMonth />
      <TimeshareJumbotron />
      <HowItWorks />
    <hr />
  <NFTCardDeck nfts={publicTimeshares} isLoading={isLoading}
    loadMoreFunc={loadMoreTimeshareMonths} hasMore={publicTimesharesOffset > 0}/>
    <Credits />
    </div>
  )
}

export default Home
