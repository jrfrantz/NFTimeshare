import { Row, Col, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Gift, ArrowLeftRight, Diagram3Fill } from 'react-bootstrap-icons';
import '../css/howitworks.css'

export const HowItWorks = (props) => {
  console.log(props);

  // gift
  // arrow left right
  // diagram 3 fill
  return (
    <Container fluid>
      <Row >
        <Col lg>
          <Gift className="cta-icon"/>
           <h5>Any NFT can be converted into 12 timeshare NFTs -- one for each month.</h5>
         </Col>
        <Col lg>
          <ArrowLeftRight className="cta-icon"/>
          <h5>Timeshares can be bought, sold, and traded like any other NFTs.</h5>
        </Col>
        <Col lg>
          <Diagram3Fill className="cta-icon"/>
          <h5>You can always exchange back all 12 months to get your original NFT.</h5>
        </Col>
      </Row>
      <Row className='get-started-button'>
        <Link to="/getstarted">
          <Button>
            Deposit an NFT
          </Button>
        </Link>
      </Row>
    </Container>
  );
}
