import { Row, Col, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Gift, ArrowLeftRight, Diagram3Fill } from 'react-bootstrap-icons';

export const HowItWorks = (props) => {
  console.log(props);

  // gift
  // arrow left right
  // diagram 3 fill
  return (
    <Container fluid>
      <Row >
        <Col lg>
          <Gift size='5rem'/>
           <h5>Any NFT can be converted into 12 timeshare NFTs -- one for each month.</h5>
         </Col>
        <Col lg>
          <ArrowLeftRight size='5rem' />
          <h5>Timeshares can be bought, sold, and traded like any other NFTs.</h5>
        </Col>
        <Col lg>
          <Diagram3Fill size='5rem'/>
          <h5>You can always exchange back all 12 months to get your original NFT.</h5>
        </Col>
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
