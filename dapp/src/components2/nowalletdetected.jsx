import { Modal, Button, Badge } from 'react-bootstrap'
export const NoWalletDetected = (props) => {

  return (
    <Modal show={props.needsWallet} onHide={props.dismissFunc}>
      <Modal.Header>
        <Modal.Title>
          No ethereum wallet detected
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        In order to timeshare an NFT, or redeem timeshares back for the
        original NFT, you need an Ethereum-compatible wallet. Try
        <a href='metamask.io' target="_blank" rel='noopener noreferrer'>
          {' '}Metamask{' '}
        </a>
         for example.
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.dismissFunc}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
