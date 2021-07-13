import { Jumbotron, Button, Badge, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import backgroundImg from '../assets/lighthouse.png'
import '../css/timesharejumbotron.css'

export const TimeshareJumbotron = (props) => {
  console.log(props);
  return (
    <Jumbotron className='hero' fluid>
      <Container className='site-cta'>
        <Row className='topline-header'>
          <h1>NFT Timeshares</h1>
        </Row>
        <Row className='subtitle-row'>
            <h5 className='pitch-subtitle'>
              Own an entire NFT -- for a month each year.
            </h5>
            {' '}<Badge variant='warning' className='beta-badge'>BETA</Badge>
        </Row>
        <Row>
          <Link to='/getstarted'>
            <Button>
              Get started
            </Button>
          </Link>
        </Row>
      </Container>
    </Jumbotron>
  );
}
