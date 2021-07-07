import { Card, CardColumns, CardDeck, Badge, Button } from 'react-bootstrap'
export const Redeemable = (props) => {
  if (!props.nfts || !Object.keys(props.nfts).length) {
    return <p>No NFTS returned</p>;
  }
  return (
    <CardColumns>
      {props.nfts.map((nft, i) => {
        return (
          <Card style={{width: '30rem'}} key={`deposit_card_${i}`}>
            <Card.Img variant="top" src={nft.media} />
          <Card.Body>
            <Card.Title>
              {nft.name}
            </Card.Title>
            <Button onClick={()=> props.onClickRedeem(nft)}>
              Redeem
            </Button>
          </Card.Body>
          </Card>
        )
      })}
    </CardColumns>
  )
}
