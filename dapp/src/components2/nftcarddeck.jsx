import { CardDeck, CardColumns,
            Card,
            Container,
            Media,
            Row,
            Col } from 'react-bootstrap';

export const NFTCardDeck = (props) => {

  if (!props.nfts || !Object.keys(props.nfts).length) {
    console.log("provided empty nft");
    return null;
  }
  console.log("props are", props.nfts);
  return (
    <Container fluid>
        <CardColumns>
          {props.nfts.map((nft, i) => {
            return (
              <Card style={{width: '22rem'}} key={"nft_card_"+i}>
                <Card.Img variant="top" src={nft.media} />
                <Card.Body>
                  <Card.Title> {nft.name} </Card.Title>
                </Card.Body>
              </Card>
          )})}
        </CardColumns>
    </Container>
  );
}
