import { Card, CardColumns, Container, Row, Col, CardDeck, Badge, Button, Spinner } from 'react-bootstrap'
import { CalendarMonth, Calendar3 } from 'react-bootstrap-icons'
import '../css/nftcarddeck.css'
export const Redeemable = (props) => {
  if (!props.nfts) {
    return null;
  }
  if (!props.nfts.length && props.hasMore < 0) {
    return (
      <Container><Row className='my-2'><Col>
        <h6 >
          No Timeshares were found for your address. Deposit an NFT
          to make some!
        </h6>
      </Col></Row></Container>

    )
  }

  function getHeading() {
    if (!props.nfts.length) {
      return null;
    }
    return (
      <Row><Col>
      <h6>
        You can redeem the original underlying NFT if you own or operate
      all 12 of its timeshares
      </h6>
      </Col></Row>
    )
  }

  return (
    <Container xl className='mb-3'>
      { getHeading() }
      <Row className='mx-2'>
        {props.nfts.map((nft, i) => {
          return (
            <Col md='6' lg='4' className='d-flex justify-content-center'>
              <Card className='nft-card my-3' key={`deposit_card_${i}`}>
                <Card.Header className='text-muted'>
                  < Calendar3 /> {nft.month}
                </Card.Header>
                <Card.Img variant="top" className='nft-card-img' src={nft.media} />
                <Card.Title className='text-center mt-auto'>
                  {nft.name}
                </Card.Title>
                <Card.Footer className='text-center'>
                  <Button variant='outline-secondary'
                    onClick={()=> props.onClickRedeem(nft)}>
                    Redeem
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          )
        })}
      </Row>
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
    </Container>
  )
}
