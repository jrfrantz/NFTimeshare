import { Card, Badge, Button, Modal, Image } from 'react-bootstrap'
export const DepositModal = (props) => {
  if (!props.nftInfo || props.nftInfo.method !== "DEPOSIT") {
    return null;
  }

  const nft = props.nftInfo.nft;
  console.log("redeem modal media " , nft);
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
        <Button
          onClick={() => props.confirmDepositFunc(nft.asset_contract.address, nft.token_id)}>
          Deposit
        </Button>
      </Modal.Footer>

    </Modal>
  );
}
