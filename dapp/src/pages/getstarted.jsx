import { useState, useEffect } from 'react'
import SmoothScroll from 'smooth-scroll'
import axios from 'axios'
import { ethers } from 'ethers'
import contractAddress from "../contracts/contract-address.json"
import TestNFTArtifact from "../contracts/TestNFT.json"
import NFTimeshareArtifact from "../contracts/NFTimeshare.json"
import NFTimeshareMonthArtifact from "../contracts/NFTimeshareMonth.json"
//import { ConnectWallet } from '../components/connectwallet'
import { DepositRedeemExplainer } from "../components/depositredeemexplainer"
import { Redeemable } from '../components/redeemable'
import { Depositable } from '../components/depositable'
import { DepositModal } from '../components/depositmodal'
import { RedeemModal } from '../components/redeemmodal'
import ERC721abi from "../contracts/ERC721abi.json"
import { Modal, Toast, Alert } from 'react-bootstrap'
import { Credits } from '../components/credits'
import {TransactionAlerts } from '../components/transactionalerts'
import { NoWalletDetected } from '../components/nowalletdetected'

const GetStarted = () => {
  const [address, setAddress] = useState("");
  const [needsWallet, setNeedsWallet] = useState(false);

  const [nftimeshare, setNftimeshare] = useState({});
  const [nftimesharemonth, setNftimesharemonth] = useState({});
  const [ethersProvider, setEthersProvider] = useState(null);

  const [ownedTimeshares, setOwnedTimeshares] = useState([]);
  const [ownedTimesharesOffset, setOwnedTimesharesOffset] = useState(0);
  const [isLoadingOwnedTimeshares, setLoadingOwnedTimeshares] = useState(false);

  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [ownedNFTsOffset, setOwnedNFTsOffset] = useState(0);
  const [isLoadingOwnedNFTs, setLoadingOwnedNFTs] = useState(false);

  // nft to show in modal
  const [selectedNFT, setSelectedNFT] = useState(null);
  // in-progress deposit and redeem actions
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  // txns that are in-progress or recently completed. {hash: status,}
  const [sentTxns, setSentTxns] = useState([])


  // get address
  useEffect(() => {
    if (!window.ethereum) {
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
    if (!window.ethereum) {
      setNeedsWallet(true);
      return;
    }
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
  const handleAcknowledgeNeedsWallet = () => {
    setNeedsWallet(false);
  }
  const handleCloseModal = () => {
    setSelectedNFT(null);

  }

  // should be triggered when someone presses Lets do it the modal
  async function confirmDepositNft(externalContract, externalTokenId) {
    console.log("depositing");
    console.log("contract, token: ", externalContract, externalTokenId);
    console.log(new ethers.providers.Web3Provider(window.ethereum).getSigner(0));

    var status = "PENDING";
    setPendingDeposits((deposits) => {
      return [
        ...deposits,
        {
          contract: externalContract.toLowerCase(),
          tokenId:  externalTokenId.toLowerCase(),
          status: status
        }
      ]
    });
    try {
      let erc721Contract = new ethers.Contract(
        externalContract,
        ERC721abi.interface,
        new ethers.providers.Web3Provider(window.ethereum).getSigner(0)
      );
      // TODO check if already approved to avoid needing to do so again
      var approvalTx = await erc721Contract.setApprovalForAll(contractAddress.NFTimeshare, true);

      var tx = await nftimeshare.deposit(
        externalContract,
        externalTokenId,
        address,
        address
      );
      if (tx) {
        setSentTxns((txns) => {
          return [
            ...txns,
            {
              txHash: tx.hash,
              contract: externalContract,
              tokenId: externalTokenId,
              method: "DEPOSIT",
              status: status
            }
          ]
        });
        ethersProvider.waitForTransaction(tx.hash, 5);
        status = "SUCCESS";
      }
    } catch (error) {
      console.log("rejected deposit ", error);
      status = "ERROR";
    } finally {
      if (!tx) {
        return;
      }
      setPendingDeposits((deposits) => {
        var idx = deposits.findIndex(
          (deposit) => deposit.contract === externalContract.toLowerCase && deposit.tokenId === externalTokenId.toLowerCase()
        );
        console.log("found at ", idx);
        return [
          ...deposits.splice(idx, 1),
          {
            contract: externalContract.toLowerCase(),
            tokenId: externalTokenId.toLowerCase(),
            status: status
          }
        ];
      });

      setSentTxns((txns) => {
        var idx = txns.findIndex(
          (txn) => txn.txHash === tx.hash
        );
        console.log('found txn at ', idx, txns[idx]);
        return [
            ...txns.splice(idx, 1),
            {
              txHash: tx.hash,
              contract: externalContract,
              tokenId: externalTokenId,
              method: "DEPOSIT",
              status: status
            }
          ];
        });
      }

    }

  function dismissTxnAlert(txn) {
      setSentTxns((txns) => {
        var idx = txns.findIndex((tx) => tx.txHash === txn.txHash);
        if (idx > -1) {
          return [...txns.splice(idx, 1)]
        } else {
          console.log("nothing. index is ", idx, txns[idx]);
          return txns
        }
      })
    }

  // should be triggered when someone presses redeem in the modal on any timesharemonth
  async function redeemNft(timeshareMonthTokenId) {
    console.log("redeeming with ", timeshareMonthTokenId);
    let parentTokenId = await nftimesharemonth.getParentTimeshare(timeshareMonthTokenId);
    let siblingIds = await nftimesharemonth.getTimeshareMonths(parentTokenId);
    siblingIds = siblingIds.map((elem) => elem.toString().toLowerCase());
    console.log("Redemptions, sibs", )

    var status = "PENDING";

    setPendingRedemptions((redemptions) => {
      return [
        ...redemptions,
        ...siblingIds.map(
          (tokenId) => {
            return {
              tokenId: tokenId,
              status: status
            };
          })
      ];
    });


    try {
      var tx = await nftimeshare.redeem(parentTokenId, address);
      if (tx) {
        setSentTxns((txns) => {
          return [
            ...txns,
            {
              txHash: tx.hash,
              method: "REDEEM",
              status: status
            }
          ]
        })
        ethersProvider.waitForTransaction(tx.hash, 5);
        status = "SUCCESS";
      }
    } catch (error) {
      console.log(error);
      status = "ERROR";
    } finally {
      setPendingRedemptions((redemptions) => {
        var filtered = redemptions.filter(
          (redemption) => siblingIds.includes(redemption.TokenId)
        );
        return [
          ...filtered,
          ...siblingIds.map(
            (tokenId) => {
              return {
                tokenId: tokenId,
                status: status
              }
            })
        ];
      });
      setSentTxns((txns) => {
        if (!tx) {
          return txns;
        }
        var idx = txns.findIndex(
          (txn) => txn.txHash === tx.hash
        );
        console.log('found txn at ', idx, txns[idx]);
        return [
          ...txns.splice(idx,1),
          {
            txHash: tx.hash,
            method: "REDEEM",
            status: status
          }
        ]
      })
    }

  }
  console.log("entering render with ", pendingDeposits, pendingRedemptions);
  return (
    <div>
      <NoWalletDetected needsWallet={needsWallet}
        dismissFunc={handleAcknowledgeNeedsWallet}/>
      <DepositRedeemExplainer address={address} connectFunc={()=>connectWallet()} />
      <TransactionAlerts txnAlerts={sentTxns} dismissFunc={dismissTxnAlert}/>
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
        pendingDeposits={pendingDeposits}
        viewerAddress={address}/>
      <RedeemModal nftInfo={selectedNFT}
        handleCloseFunc={handleCloseModal}
        confirmRedeemFunc={redeemNft}
        pendingRedemptions={pendingRedemptions}/>
      <Credits />
    </div>
  )
}

export default GetStarted
