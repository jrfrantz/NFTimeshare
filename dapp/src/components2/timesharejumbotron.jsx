import { Jumbotron, Button, Badge, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import backgroundImg from '../assets/lighthouse.png'
import '../css/timesharejumbotron.css'

export const TimeshareJumbotron = (props) => {
  console.log(props);
  return (
    <Jumbotron className='hero' fluid>
      <Container className='site-cta mt-5'>
        <Row className='topline-header '>
          <h1 >NFT Timeshares</h1>
        </Row>
        <Row className='justify-content-center mx-2'>
          <Col md='auto'>
              <h5 className='pitch-subtitle mb-0'>
                Own an entire NFT -- for a month each year.
              </h5>
              <Badge variant='dark' pill
                className='beta-badge ml-1 py-1 '>Beta</Badge>
              <Badge variant='warning' pill
                className='beta-badge ml-1 py-1 '>Rinkeby</Badge>
          </Col>
        </Row>
        <Row >
          <Col className='d-flex justify-content-center'>
          <Link to='/getstarted'>
            <Button size='lg'>
              Get started
            </Button>
          </Link>
          </Col>
        </Row>
      </Container>
    </Jumbotron>
  );
}
