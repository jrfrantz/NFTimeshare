import { Card, CardColumns, CardDeck, Badge, Button } from 'react-bootstrap'
export const Depositable = (props) => {
  if (!props.nfts || !Object.keys(props.nfts).length) {
    return <p>No NFTS returned</p>;
  }

  // populated by setOwnedNFTs endpoint (OWNED_ASSETS_API);
  return (
    <CardColumns>
      {props.nfts.map((nft, i) => {
        return (
          <Card key={`deposit_card_${i}`}>
            <Card.Title>
              <p>{nft.name} test</p>
            </Card.Title>
          <Card.Body>
            <Card.Img variant="top" src={nft.media} height='64px' width='64px'/>
          </Card.Body>
          <Card.Footer>
          <Button onClick={() => props.onClickDeposit(nft)}>
            Deposit
          </Button>
          </Card.Footer>
          </Card>
        )
      })}
    </CardColumns>
  )

}
