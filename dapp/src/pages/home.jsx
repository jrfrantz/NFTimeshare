import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import SmoothScroll from 'smooth-scroll'
import contractAddress from "../contracts/contract-address.json"

import { NFTCardDeck } from '../components/nftcarddeck';
import { TimeshareJumbotron } from "../components/timesharejumbotron";
import { HowItWorks } from "../components/howitworks";
import { Credits } from "../components/credits";
import { ChooseMonthModal } from '../components/choosemonthmodal'
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

  const [selectedTimeshare, setSelectedTimeshare] = useState(null);
  const [childTimeshareMonths, setChildTimeshareMonths] = useState(null);

  const loadMoreTimeshareMonths = () => {
    //const ALL_TIMESHARES_API = `/api/alltimesharemonths/${publicTimesharesOffset}`;
    const ALL_TIMESHARES_API = `/api/alltimeshares/${publicTimesharesOffset}`;
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

  const handleTimeshareSelection = (parentNft) => {
    setSelectedTimeshare(parentNft);
  }
  const clearTimeshareSelection = () => {
    console.log('cleared timeshare selection');
    setSelectedTimeshare(null);
    setChildTimeshareMonths(null);
  }

  // load data required to show the month selection modal
  useEffect(() => {
    if (!selectedTimeshare) {
      return;
    }
    console.log('selected ', selectedTimeshare);
    const API_CHILD_IDS_FOR_TIMESHARE = `/api/monthTokensForTimeshare/${selectedTimeshare.token_id}`
    axios.get(API_CHILD_IDS_FOR_TIMESHARE).then(function (response) {
      if (response !== 200 || !response.data ) {
        console.log("Bad response from server", response);
      }
      console.log("Child nfts are ", response.data.nfts);
      setChildTimeshareMonths(response.data.nfts);
    });
  }, selectedTimeshare)

  return (
    <div>
      <ChooseMonthModal selection={selectedTimeshare}
        clearFunc={clearTimeshareSelection}
        monthLinks={childTimeshareMonths} />
      <TimeshareJumbotron />
      <HowItWorks />
    <hr />
  <NFTCardDeck nfts={publicTimeshares} isLoading={isLoading}
    selectionFunc={handleTimeshareSelection}
    loadMoreFunc={loadMoreTimeshareMonths} hasMore={publicTimesharesOffset > 0}/>
    <Credits />
    </div>
  )
}

export default Home
