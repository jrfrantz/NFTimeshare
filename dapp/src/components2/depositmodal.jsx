import { Card, Badge, Button, Modal, Image, Alert } from 'react-bootstrap'
export const DepositModal = (props) => {

  if (!props.nftInfo || !props.nftInfo.nft || props.nftInfo.method !== "DEPOSIT") {
    return null;
  }

  const nft = props.nftInfo.nft;

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
          text: "Successfully deposited!"
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
  return (
    <Modal show={nft != null} onHide={props.handleCloseFunc}>
      <Modal.Header closeButton>
        <Modal.Title>Make Timeshare</Modal.Title>
      </Modal.Header>
      <Image src={nft.media} width='100%'/>
      <Modal.Body>
          Turn this NFT into a Timeshare. In exchange for this token, you'll get back
          12 NFTs, one for each month.
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
