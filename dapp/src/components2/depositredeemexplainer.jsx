import { Badge, Spinner , Button, Jumbotron, Container, Row, Col } from 'react-bootstrap';
import contractAddress from "../contracts/contract-address.json"

export const DepositRedeemExplainer = (props) => {
  const CONTACT_HREF =
    <a href='https://twitter.com/therealjfrantz'
      target="_blank" rel="noopener noreferrer">
      contact us
    </a>
  const GITHUB_HREF =
    <a href='https://github.com/jrfrantz/NFTimeshares'
      target="_blank" rel="noopener noreferrer">
      here
    </a>
    return (
        <Jumbotron className='pb-4' fluid>
          <Container className='mb-0'>
            <Row>
              <Col>
              <h1>Deposit or Redeem Timeshares {' '}
                <small>
                  <Badge variant='warning' size='sm'>BETA</Badge>
                {' '}<Badge variant='secondary' size='sm'>Rinkeby</Badge>
                </small>
            </h1>

              </Col>
            </Row>
            <Row className='px-1'>
              <Col>
                <p>
                    Deposit any ERC721 token to receive 12 newly-minted NFTs in return
                    -- one for each month of the year. Each NFT has a different month
                    associated with it on the Ethereum blockchain. These don't "expire"
                    after a year -- you own the asset fully for the same month each year.
                </p>
                <p>
                    You can always redeem the underlying asset by giving back all
                    of the 12 timeshares. You must own or operate all 12 timeshares
                    to get back the original NFT.
                </p>
                <p>
                    All code is open source and can be viewed {GITHUB_HREF}.
                    It has not been professionally audited. If you're a project or
                    developer looking to integrate Timeshares, {CONTACT_HREF}!
                </p>
              </Col>
            </Row>
            <Row className='align-self-flex-end mt-3'>
                <Col className='d-flex justify-content-center'>
                  {!props.address ?
                  <Button size="lg" onClick={props.connectFunc}> Connect wallet </Button>
                : <Button size='lg' variant="outline-success" disabled>{props.address}</Button>}
              </Col>
            </Row>
          </Container>
        </Jumbotron>
    )
}
