import { Card, CardColumns, CardDeck, Badge, Button, Spinner } from 'react-bootstrap'
export const Depositable = (props) => {
  if (!props.nfts) {
    return null;
  }

  // populated by setOwnedNFTs endpoint (OWNED_ASSETS_API);
  return (
    <div>
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
      {props.isLoading &&
         <Spinner animation='border' variant='dark' /> }
      {props.hasMore > 0 && !props.isLoading && 
        <Button onClick={props.loadMoreFunc} variant='outline-secondary'>
          Load more
        </Button>
      }
    </div>
  )

}
