import { Modal, Badge, Container, Row, Col, Button } from 'react-bootstrap'
export const ChooseMonth = (props) => {

  var monthnfts = [
    ...Array(12).keys()
  ];
  return (
    <Modal show={false} onHide={()=> {return;} }>
      <Modal.Header>
        <Modal.Title>
          Choose a Month
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            {monthnfts.map((nft, i) => {
              return (
                <Col md='4' className='my-3'>
                  <Button variant='outline-secondary' className='btn-block rounded-pill'>
                    {nft}
                  </Button>

                </Col>
              )
            })}
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  )
}
