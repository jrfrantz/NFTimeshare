import { Card, Badge, Button, Modal, Image } from 'react-bootstrap'
export const RedeemModal = (props) => {
  if (!props.nftInfo || !props.nftInfo.nft || props.nftInfo.method !== "REDEEM") {
    return null;
  }
  const nft = props.nftInfo.nft;
  console.log("not returning null, ", props.nft !== null);
  return (
    <Modal show={nft !== null} onHide={props.handleCloseFunc}>
      <Modal.Header closeButton>
        <Modal.Title>Redeem your NFT</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Image src={nft.media} width='100%'></Image>
        You must own all 12 timeshares to redeem the media.
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={()=> props.confirmRedeemFunc(nft.token_id)}>
          Redeem NFT
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
