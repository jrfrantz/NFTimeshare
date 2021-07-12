import { useState, useEffect } from 'react'
import SmoothScroll from 'smooth-scroll'
import axios from 'axios'
import { ethers } from 'ethers'
import contractAddress from "../contracts/contract-address.json"
import TestNFTArtifact from "../contracts/TestNFT.json"
import NFTimeshareArtifact from "../contracts/NFTimeshare.json"
import NFTimeshareMonthArtifact from "../contracts/NFTimeshareMonth.json"
//import { ConnectWallet } from '../components/connectwallet'
import { DepositRedeemExplainer } from "../components2/depositredeemexplainer"
import { Redeemable } from '../components2/redeemable'
import { Depositable } from '../components2/depositable'
import { DepositModal } from '../components2/depositmodal'
import { RedeemModal } from '../components2/redeemmodal'
import ERC721abi from "../contracts/ERC721abi.json"
import { Modal } from 'react-bootstrap'
import { Credits } from '../components2/credits'

const GetStarted = () => {
  const [address, setAddress] = useState("");


  const [nftimeshare, setNftimeshare] = useState({});
  const [nftimesharemonth, setNftimesharemonth] = useState({});
  const [ethersProvider, setEthersProvider] = useState(null);

  const [ownedTimeshares, setOwnedTimeshares] = useState([]);
  const [ownedTimesharesOffset, setOwnedTimesharesOffset] = useState(0);
  const [isLoadingOwnedTimeshares, setLoadingOwnedTimeshares] = useState(false);

  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [ownedNFTsOffset, setOwnedNFTsOffset] = useState(0);
  const [isLoadingOwnedNFTs, setLoadingOwnedNFTs] = useState(false);

  const [selectedNFT, setSelectedNFT] = useState(null);
  const [pendingDeposits, setPendingDeposits] = useState(new Set());
  const [pendingRedemptions, setPendingRedemptions] = useState(new Set());
  // TODO change the redemptions to a JSON and useEffect to monitor for changes.

  // get address
  useEffect(() => {
    if (!window.ethereum) {
      console.log("no ethereum window");
      return;
    }
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      console.log("Account changed to ", newAddress);
      setAddress(newAddress);
    })
  }, []);


  // all owned NFTs, backend
  function loadOwnedNFTs() {
    if (!address) {
      return;
    }
    const OWNED_ASSETS_API = `/api/ownednfts/${address}/${ownedNFTsOffset}`; //todo pagination
    setLoadingOwnedNFTs(true);
    axios.get(OWNED_ASSETS_API).then(function(response) {
      if (response.status !== 200) {
        console.log("Error from backend", response);
        return;
      }
      console.log("Owned nfts are", response);
      /*var cleanedAssets = response.data.nfts.filter((nft) => {
        return nft.asset_contract.address.toLowerCase() !== contractAddress.NFTimeshareMonth.toLowerCase()
      });*/ //took care of this in the api hopefully.
      setOwnedNFTs((prevnfts) => [...prevnfts, ...response.data.nfts]);
      setOwnedNFTsOffset(response.data.nextOffset);
      setLoadingOwnedNFTs(false);
    });
  }

  // all owned timesharemonths, backend
  function loadOwnedTimeshareMonths() {
    if (!address) {
      return;
    }
    const API_OWNED_NFTIMESHAREMONTHS = `/api/ownedtimesharemonths/${address}/${ownedTimesharesOffset}`;
    setLoadingOwnedTimeshares(true);
    axios.get(API_OWNED_NFTIMESHAREMONTHS).then(function(response) {
      console.log("owned tsmonths", response);
      setOwnedTimeshares((prevnfts) => [...prevnfts, ...response.data.nfts]);
      setOwnedTimesharesOffset(response.data.nextOffset);
      setLoadingOwnedTimeshares(false);
    })
  }
  useEffect(() => { loadOwnedNFTs(); }, [address])

  useEffect(() => { loadOwnedTimeshareMonths(); }, [address])




  const connectWallet = async () => {
    const [selectedAddress] = await window.ethereum.enable();
    console.log(selectedAddress);

    let prov = new ethers.providers.Web3Provider(window.ethereum, "any");
    prov.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
            window.location.reload();
        }
    });
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
    setEthersProvider(prov);
  };

  const onClickDeposit = (nft) => {
    console.log("selected an nft" , nft);
    setSelectedNFT({nft: nft, method: "DEPOSIT"});
  }
  const onClickRedeem = (nft) => {
    console.log("selected an nft: ", nft)
    setSelectedNFT({nft: nft, method: "REDEEM"});
  }

  const handleCloseModal = () => {
    setSelectedNFT(null);
  }

  // should be triggered when someone presses Lets do it the modal
  async function confirmDepositNft(externalContract, externalTokenId) {
    console.log("depositing");
    console.log("contract, token: ", externalContract, externalTokenId);
    console.log(new ethers.providers.Web3Provider(window.ethereum).getSigner(0));
    let erc721Contract = new ethers.Contract(
      externalContract,
      ERC721abi.interface,
      new ethers.providers.Web3Provider(window.ethereum).getSigner(0)
    );

    const pendingDeposit = {
      externalContract: externalContract,
      externalTokenId: externalTokenId
    }
    setPendingDeposits((deposits) => {
      deposits.add(JSON.stringify(pendingDeposit));
      return deposits;
    });

    await erc721Contract.setApprovalForAll(contractAddress.NFTimeshare, true);
    // handle errors for setApprove rejections here.
    var tx = await nftimeshare.deposit(
      externalContract,
      externalTokenId,
      address,
      address
    );
    // handle deposit errors here

    console.log('tx submitted', pendingDeposit);
    ethersProvider.waitForTransaction(tx.hash, 5);
    console.log('waitfor completed', tx);

    setPendingDeposits((deposits) => {
      deposits.delete(JSON.stringify(pendingDeposit));
      return deposits;
    });
  }

  // should be triggered when someone presses redeem in the modal on any timesharemonth
  async function redeemNft(timeshareMonthTokenId) {
    console.log("redeeming with ", timeshareMonthTokenId);
    let parentTokenId = await nftimesharemonth.getParentTimeshare(timeshareMonthTokenId);
    let siblingIds = await nftimesharemonth.getTimeshareMonths(parentTokenId);
    siblingIds = siblingIds.map((elem) => elem.toString().toLowerCase());
    console.log("Redemptions, sibs", )
    setPendingRedemptions((redemptions) => {
      siblingIds.forEach((tokenId) => {
        redemptions.add(tokenId)
      })
      return redemptions;
    })
    console.log('entering redeem');
    var tx = await nftimeshare.redeem(parentTokenId, address);
    console.log('tx submitted ', tx);
    ethersProvider.waitForTransaction(tx.hash, 5);
    console.log('wait for completed', tx);
     // provider.waitForTransaction(hash, confirms?, timeout?)
    console.log('submitted redeem', siblingIds);
    console.log('finishd waiting for tx redeem', siblingIds);
    setPendingRedemptions((redemptions) => {
      siblingIds.forEach((tokenId) => {
        redemptions.delete(tokenId);
      });
      return redemptions;
    });
  }
  console.log("entering render with ", pendingDeposits, pendingRedemptions);
  return (
    <div>
      <DepositRedeemExplainer address={address} connectFunc={()=>connectWallet()} />
      <Depositable isLoading={isLoadingOwnedNFTs}
        nfts={ownedNFTs} onClickDeposit={onClickDeposit}
        loadMoreFunc={loadOwnedNFTs} hasMore={ownedNFTsOffset}/>
      <hr />
      <Redeemable isLoading={isLoadingOwnedTimeshares}
          nfts={ownedTimeshares} onClickRedeem={onClickRedeem}
          loadMoreFunc={loadOwnedTimeshareMonths} hasMore={ownedTimesharesOffset}/>
      <DepositModal nftInfo={selectedNFT}
        handleCloseFunc={handleCloseModal}
        confirmDepositFunc={confirmDepositNft}
        pendingDeposits={pendingDeposits}/>
      <RedeemModal nftInfo={selectedNFT}
      handleCloseFunc={handleCloseModal}
      confirmRedeemFunc={redeemNft}
      pendingRedemptions={pendingRedemptions}/>
    <Credits />
  </div>
)
}

/*
<Modal modalState={modalState} closeModal={onCloseModal}
        depositFunc={depositNft} redeemFunc={redeemNft}/>
<Explainer />
<ConnectWallet connectedWallet={address} connectFunc={() => connectWallet()}/>
<Depositable nfts={getOwnedNFTData()}/>
<Redeemable nfts={getTimeshareData()} />
*/

export default GetStarted
