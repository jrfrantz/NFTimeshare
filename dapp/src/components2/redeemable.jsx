import { Card, CardColumns, CardDeck, Badge, Button, Spinner } from 'react-bootstrap'
export const Redeemable = (props) => {
  if (!props.nfts) {
    return null;
  }



  return (
    <div>
      { !!props.nfts.length &&
        <h6>If you own all 12 timeshares, you can redeem it back </h6>
      }
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
      {props.isLoading &&
        <div>
          <Spinner animation='outline'/>
        <p>Loading your timeshares from the blockchain. This usually takes a minute...</p>
        </div>
      }
      {props.hasMore > 0 && !props.isLoading &&
        <Button onClick={props.loadMoreFunc} variant='outline-secondary'>
          Load more
        </Button>
      }
    </div>
  )
}
