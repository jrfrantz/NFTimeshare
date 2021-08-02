import { Card, Badge, Button, Modal, Image, Alert } from 'react-bootstrap'
export const DepositModal = (props) => {

  if (!props.nftInfo || !props.nftInfo.nft || props.nftInfo.method !== "DEPOSIT") {
    return null;
  }

  const nft = props.nftInfo.nft;
  const isERC721 = props.nftInfo.nft.asset_contract.schema_name === "ERC721"
  const isCustodied = props.nftInfo.nft.owner.address === props.viewerAddress /*selectedaddr*/
  console.log("is erc721? ", isERC721);
  console.log("is direct custody? ", isCustodied);


  var externalContract = nft.asset_contract.address.toLowerCase();
  var externalTokenId = nft.token_id.toLowerCase()

  var pendingStatus = props.pendingDeposits.find((elem) => {
    return elem.contract === externalContract && elem.tokenId === externalTokenId;
  });
  pendingStatus = pendingStatus || {};

  console.log("pendingdeposits is ", props.pendingDeposits);
  console.log("deposit modal media " , nft);
  console.log("in deposit modal with ", props.pendingDeposits);

  function getButtonProps(state) {
    switch (state) {
      case "PENDING":
        return {
          disabled: true,
          text: "Depositing..."
        };
      case "SUCCESS":
        return {
          disabled: true,
          variant: "outline-success",
          text: "Transaction sent!"
        };
      case "ERROR":
        return {
          disabled: true,
          variant: "outline-danger",
          text: "Error depositing. Try refresh"
        };
      default:
        return {
          disabled: false,
          text: "Deposit"
        }
    }
  }

  if (!isERC721) {
    /*Don't yet support ERC1155*/
    return (
      <Modal show={nft != null} onHide={props.handleCloseFunc}>
        <Modal.Header>
          <Modal.Title>
            Error: Can only deposit ERC721 NFTs
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-danger'>
          <Image src={nft.media} width='100%'/>
          According to{' '}
          <a href={nft.permalink} target="_blank" rel="noopener noreferrer">
          Opensea.io
          </a>
          , this token is an {nft.asset_contract.schema_name}, not an ERC721.
          Only ERC721 tokens can be deposited and turned into Timeshares.
        </Modal.Body>
        <Modal.Footer>
          <Button className='btn-block' variant='outline-danger' disabled>
            Deposit
          </Button>
        </Modal.Footer>
      </Modal>
    )
  } else if (!isCustodied) {
    return (
      <Modal show={nft != null} onHide={props.handleCloseFunc}>
        <Modal.Header>
          <Modal.Title>
            Error: Asset not owned by this wallet.
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-danger'>
          <Image src={nft.media} width='100%'/>
          According to{' '}
          <a href={nft.permalink} target="_blank" rel="noopener noreferrer">
          Opensea.io
          </a>
          , this token isn't owned by the wallet that's been connected to this site.
          This can happen if Opensea is custodying the NFT for your account, instead
          of being owned directly by you. If so, this can be solved by transferring
          it to your wallet address on Opensea.
        </Modal.Body>
        <Modal.Footer>
          <Button className='btn-block' variant='outline-danger' disabled>
            Deposit
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <Modal show={nft != null} onHide={props.handleCloseFunc} background={pendingStatus.status === "PENDING" ? "static" : ""}>
      <Modal.Header closeButton>
        <Modal.Title>Make a Timeshare</Modal.Title>
      </Modal.Header>
      <Image src={nft.media} width='100%'/>
      <Modal.Body>
          <p>Turn this NFT into a Timeshare. In exchange for this token, you'll get back
          12 NFTs, one for each month.</p>
          <p class='text-muted'>
            <a href={nft.permalink} class='text-muted'
              target="_blank" rel="noopener noreferrer">
            View on Opensea ↗
            </a>
          </p>
          
      </Modal.Body>
      <Modal.Footer>
        <Button className='btn-block'
          onClick={() => props.confirmDepositFunc(nft.asset_contract.address, nft.token_id)}
          {...getButtonProps(pendingStatus.status)}>
          {getButtonProps(pendingStatus.status).text}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
