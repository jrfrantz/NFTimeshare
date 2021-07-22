import { Modal, Image, Badge, Container, Row, Col, Button, Spinner } from 'react-bootstrap'
import { CalendarMonth, Calendar3 } from 'react-bootstrap-icons'
export const ChooseMonthModal = ({selection, clearFunc, monthLinks, ...props}) => {

  /*var monthnfts = [
    ...Array(12).keys()
  ];*/
  if (!selection) {
    return null;
  }
  return (
    <Modal show={!!selection} onHide={clearFunc} >
      <Modal.Header closeButton>
        <Modal.Title>
          Choose a Month
        </Modal.Title>
      </Modal.Header>
      <Image src={selection.media} width='100%'/>
    <Modal.Footer>
        <Container>
          <Row >
            { !!monthLinks && monthLinks.map((nft, i) => {
              return (
                <Col xs='4' className='px-1 py-1 px-md-2 py-md-2'>
                  <Button variant='outline-secondary'
                    className={
                      'btn-block rounded-pill text-truncate' +
                      ' py-1 px-2' +
                      ' '
                    }
                    href={nft.asset_url}
                    target="_blank" rel="noopener noreferrer">
                     { nft.month}
                  </Button>
                </Col>
              )
            })}
            {
              !monthLinks &&
              <Col  className='d-flex justify-content-center'>
                <Spinner animation='border'/>
              </Col>

            }
          </Row>
        </Container>
      </Modal.Footer>
    </Modal>
  )
}
