import { Modal, Image, Badge, Container, Row, Col, Button, Spinner } from 'react-bootstrap'
import { CalendarMonth, Calendar3 } from 'react-bootstrap-icons'
import media_not_found from '../assets/NFT_NO_MEDIA.jpg'
export const ChooseMonthModal = ({selection, clearFunc, monthLinks, ...props}) => {

  /*var monthnfts = [
    ...Array(12).keys()
  ];*/
  if (!selection) {
    return null;
  }
  console.log(selection);
  return (
    <Modal show={!!selection} onHide={clearFunc} >
      <Modal.Header closeButton>
        <Modal.Title>
          Choose a Month
        </Modal.Title>
      </Modal.Header>
      { selection.media.includes(".mp4") ?
        <div><video width="100%" height="100%" src={selection.media} autoplay loop muted controls></video></div> :
        <Image src={selection.media ? selection.media : media_not_found} width='100%'/>}
      { !selection.media &&
      <Modal.Body className='text-muted'>
        Opensea didn't return an image for this NFT. This usually happens for about an hour after a Timeshare (or any NFT) is created
        until Opensea checks the metadata. In the meanwhile you can {' '}
        <a href={selection.token_metadata} class='link-muted'
          target="_blank" rel="noopener noreferrer">
        view it in raw form
        </a> or {' '}
        <a href={selection.permalink}
          target="_blank" rel="noopener noreferrer">
          manually request a refresh
        </a> on Opensea.
      </Modal.Body>

      }
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
