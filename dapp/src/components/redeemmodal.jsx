import { Card, Badge, Button, Modal, Image } from 'react-bootstrap'
export const RedeemModal = (props) => {
  if (!props.nftInfo || !props.nftInfo.nft || props.nftInfo.method !== "REDEEM") {
    return null;
  }
  const nft = props.nftInfo.nft;
  var pendingStatus = props.pendingRedemptions.find((elem) => {
    return elem.tokenId === nft.token_id
  });
  pendingStatus = pendingStatus || {}
  console.log("pending? ", props.pendingRedemptions, nft.token_id);
  console.log("not returning null, ", props.nft !== null);

  function getButtonProps(state) {
    switch(state) {
      case "PENDING":
        return {
          disabled: true,
          text: "Redeeming..."
        };
      case "SUCCESS":
        return {
          disabled: true,
          variant: "outline-success",
          text: "Redeem transaction sent!"
        };
      case "ERROR":
        return {
          disabled: true,
          variant: "outline-danger",
          text: "Error Redeeming. Try refreshing"
        };
      default:
        return {
          disabled: false,
          text: "Redeem"
        }
    }
  }
  return (
    <Modal show={nft !== null} onHide={props.handleCloseFunc}>
      <Modal.Header closeButton>
        <Modal.Title>Redeem your NFT</Modal.Title>
      </Modal.Header>
      <Image src={nft.media} width='100%'></Image>
      <Modal.Body>
        <p>You must own all 12 timeshares to redeem the media.</p>
        <p class='text-muted'>
            <a href={nft.permalink} class='text-muted'
              target="_blank" rel="noopener noreferrer">
            View on Opensea ↗
            </a>
          </p>
      </Modal.Body>
      <Modal.Footer>
        <Button {...getButtonProps(pendingStatus.status)}
          onClick={()=> props.confirmRedeemFunc(nft.token_id)}>
          {getButtonProps(pendingStatus.status).text}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
