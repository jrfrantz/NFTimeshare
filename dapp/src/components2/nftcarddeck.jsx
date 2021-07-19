import { CardDeck, CardColumns, Badge,
            Card,
            Container,
            Media,
            Row,
            Col,
          Spinner ,
        Button } from 'react-bootstrap';
import { CalendarMonth, Calendar3 } from 'react-bootstrap-icons'
import contractAddress from "../contracts/contract-address.json"
import media_not_found from '../assets/NFT_NO_MEDIA.jpg'
import '../css/nftcarddeck.css'


// props should be {nfts: Array[media: url, name: str, month:str, tokenId: int]}
export const NFTCardDeck = (props) => {

  function getLoadingBar() {
    if (props.isLoading) {
      // show spinner
      console.log('showing spinner');
      return (
        <Spinner animation='border' variant='secondary'
          size='lg' role='status' />
      )
    } else if (props.hasMore) {
      return (
        <Button className='btn-block' variant='outline-secondary'
          onClick={props.loadMoreFunc}>
          Load more
        </Button>
      )
    } else if (!props.nfts.length) {
      // opensea isn't returning any timeshares

    }
  }


  console.log("props are", props.nfts);
  console.log("and offset is ", props.hasMore)
  return (
    <Container xl className='mb-3'>
      <Row className='my-2 mx-1'>
      <h3> Browse Timeshares </h3>
      </Row>
      <Row className='mx-2'>
        {props.nfts.map((nft, i) => {
          if (!nft.month) {
            console.log(nft);
          }
          return (
            <Col md='6' lg='4' className='d-flex justify-content-center'>
              <Card className='nft-card my-3' key={"nft_card_"+i}>
                <Card.Header className='text-muted'>
                  < Calendar3 /> {nft.month ? nft.month : "August"}
                </Card.Header>
                <Card.Img variant="top" className='nft-card-img mt-auto'
                  src={nft.media ? nft.media : media_not_found}
                  />
                <Card.Title className='text-center mt-auto'>
                  {nft.name}
                </Card.Title>
                <Card.Footer className='text-center'>
                  <Button variant="outline-secondary"
                    onClick={() => props.selectionFunc(nft)}>
                    Choose Time
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
        )})}
      </Row>

      <Row className='mx-2'>
        <Col className='d-flex justify-content-center'>
          {getLoadingBar()}
        </Col>
      </Row>

    </Container>
  );
}


/*
<Button variant="outline-secondary"
  href={nft.permalink}
  target="_blank" rel="noopener noreferrer">
  Choose Time
</Button>
*/
