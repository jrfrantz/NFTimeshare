import { Row, Col, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const HowItWorks = (props) => {
  console.log(props);
  return (
    <Container fluid>
      <Row >
        <Col lg> Any NFT can be converted into 12 timeshare NFTs -- one for each month.</Col>
      <Col lg> Timeshares can be bought, sold, and traded like any other NFTs.</Col>
    <Col lg> You can always exchange back all 12 months to get your original NFT.</Col>
      </Row>
      <Row>
        <Link to="/getstarted">
          <Button>
            Deposit an NFT
          </Button>
        </Link>
      </Row>
    </Container>
  );
}
