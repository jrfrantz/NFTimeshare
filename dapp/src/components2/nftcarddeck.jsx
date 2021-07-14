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
  if (!props.nfts || !Object.keys(props.nfts).length) {
    console.log("provided empty nft");
    return (
      <Container>
        <p>Loading timeshares</p>
        <Spinner animation="border" />
      </Container>
    );
  }

  console.log("props are", props.nfts);
  return (
    <Container fluid>
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
                  < Calendar3 /> {nft.month}
                </Card.Header>
                <Card.Img variant="top"
                  src={nft.media ? nft.media : media_not_found}
                  />
                <Card.Title className='d-flex justify-content-center'>
                  {nft.name}
                </Card.Title>
                <Card.Footer className='d-flex justify-content-center'>
                  <Button variant="outline-secondary"
                    href={nft.permalink}
                    target="_blank" rel="noopener noreferrer">
                    Buy on Opensea
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
        )})}
      </Row>
    </Container>
  );
}
