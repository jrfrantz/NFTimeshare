import { Row, Col, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Gift, ArrowLeftRight, Diagram3Fill, Diagram3 } from 'react-bootstrap-icons';
import '../css/howitworks.css'

export const HowItWorks = (props) => {
  console.log(props);

  // gift
  // arrow left right
  // diagram 3 fill
  return (
    <Container className='pitch-bg pb-4' fluid>
      <Container fluid>
        <Row xs='1' md='3' className='explainer-row pb-2'>
          <Col>
              <div className='d-flex justify-content-center mb-2'>
                <Gift className="cta-icon"/>
              </div>
            <h5>Any NFT can be converted into 12 timeshare NFTs — one for each month.</h5>
          </Col>
          <Col>
            <div className='d-flex justify-content-center mb-2'>
              <ArrowLeftRight className="cta-icon"/>
            </div>
            <h5>Timeshares can be bought, sold, and traded like any other NFTs.</h5>
          </Col>
          <Col >
            <div className='d-flex justify-content-center mb-2'>
              <Diagram3 className="cta-icon"/>
            </div>
            <h5>You can always exchange back all 12 months to get your original NFT.</h5>
          </Col>
        </Row>
        <Row className='align-self-flex-end mt-3 mb-2'>
          <Col className='d-flex justify-content-center'>
            <Link to="/getstarted">
              <Button variant='light'>
                Deposit an NFT
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
