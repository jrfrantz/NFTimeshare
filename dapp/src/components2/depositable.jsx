import { Card, CardColumns, Container, CardDeck, Badge, Button, Spinner, Link, Row, Col } from 'react-bootstrap'
import media_not_found from '../assets/NFT_NO_MEDIA.jpg'
import '../css/nftcarddeck.css'
export const Depositable = (props) => {
  if (!props.nfts) {
    return null;
  }

  if (!props.nfts.length && props.hasMore < 0) {
    return (
      <p>Opensea API didn't return any NFTs for your address.</p>
    )
  }

  function getHeading() {
    if (!props.nfts.length) {
      return null;
    }
    return (
      <Row className='my-2 mx-1'>
        <h3> Deposit to make an NFTimeshare </h3>
      </Row>
    )
  }

  // populated by setOwnedNFTs endpoint (OWNED_ASSETS_API);
  return (
    <Container xl className='mb-3'>
      { getHeading() }
      <Row className='mx-2'>
        {props.nfts.map((nft, i) => {
          return (
            <Col md='6' lg='4' className='d-flex justify-content-center'>
              <Card className='nft-card my-3' key={`deposit_card_${i}`}>
                <Card.Header className='deposit-nft-header'>
                  <Card.Title className='text-center'>
                    {nft.name}
                  </Card.Title>
                </Card.Header>
                <Card.Img className='nft-card-img' variant="top"
                  src={nft.media ? nft.media : media_not_found}/>
                <Card.Footer className='text-center mt-auto px-3 py-2'>
                  <Button className='btn-block px-0'
                    onClick={() => props.onClickDeposit(nft)}>
                    Deposit
                  </Button>
              </Card.Footer>
              </Card>
            </Col>
          )
        })}
      </Row>
      {props.isLoading &&
         <Spinner animation='border' variant='dark' /> }
      {props.hasMore > 0 && !props.isLoading &&
        <Button onClick={props.loadMoreFunc} variant='outline-secondary'>
          Load more
        </Button>
      }
    </Container>
  )

}
