import { CardDeck, CardColumns, Badge,
            Card,
            Container,
            Media,
            Row,
            Col,
          Spinner ,
        Button } from 'react-bootstrap';
import contractAddress from "../contracts/contract-address.json"
import media_not_found from '../assets/NFT_NO_MEDIA.jpg'


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
    <div>
      <h3> Browse Timeshares </h3>
      <CardColumns>
        {props.nfts.map((nft, i) => {
          return (
            <Card style={{width: '256px'}} key={"nft_card_"+i}>
              <Card.Img variant="top"
                src={nft.media ? nft.media : media_not_found}
                width={'256px'}/>
            <Card.Title>
                  <Badge variant="light">🗓 {nft.month}</Badge>
                  {' '}{nft.name}
                  <Card.Text> {nft.name} </Card.Text>
              </Card.Title>
              <Card.Body>
                <Button variant="outline-secondary"
                  href={`https://opensea.io/assets/${contractAddress.NFTimeshareMonth}/${nft.token_id}`}
                  target="_blank" rel="noopener noreferrer">
                  Buy on Opensea
                </Button>
              </Card.Body>
            </Card>
        )})}
      </CardColumns>

      </div>
  );
}
