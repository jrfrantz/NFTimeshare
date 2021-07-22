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

  const ETHERSCAN_HREF =
    <a href='https://rinkeby.etherscan.io/address/0xe4aa8de6adea71aab6db1deb2a34afdcc19ce295'
      target="_blank" rel="noopener noreferrer">
      here
    </a>
    return (
        <Jumbotron className='pb-4' fluid>
          <Container className='mb-0'>
            <Row className='mb-3'>
              <Col>
              <h1 className='display-4'>Deposit or Redeem Timeshares {' '}
                <small>
                  <Badge variant='warning' size='sm'>BETA</Badge>
                {' '}<Badge variant='secondary' size='sm'>Rinkeby</Badge>
                </small>
            </h1>

              </Col>
            </Row>
            <Row className='px-2'>
              <Col>
                <p>
                    <b>Deposit</b> any ERC721 token to receive 12 newly-minted NFTs in return
                    — one for each month of the year. Each NFT has a different month
                    associated with it on the Ethereum blockchain. These don't expire
                    after a year — you own the asset fully for the same month each year.
                </p>
                <p>
                    <b>Redeem</b> the underlying asset by giving back all
                    of the 12 timeshares. You must own or operate all 12 timeshares
                    to get back the original NFT.
                </p>
                <p className='text-muted'>
                    All code is open source and can be viewed {GITHUB_HREF}.
                    The contract itself can be viewed on Etherscan {ETHERSCAN_HREF}.
                    It has not been professionally audited. If you're a project or
                    developer looking to integrate Timeshares, {CONTACT_HREF}!
                </p>
              </Col>
            </Row>
            <Row className='align-self-flex-end mt-3'>
                <Col className='d-flex justify-content-center'>
                  {!props.address ?
                  <Button size="lg" onClick={props.connectFunc}> Connect wallet </Button>
                : <Button size='lg' variant="outline-success" disabled>
                  {`${props.address.slice(0,6)}...${props.address.slice(
                    props.address.length-4,
                    props.address.length
                  )}`}
                </Button>}
              </Col>
            </Row>
          </Container>
        </Jumbotron>
    )
}
