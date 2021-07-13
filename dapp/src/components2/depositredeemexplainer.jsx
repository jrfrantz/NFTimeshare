import { Badge, Spinner , Button, Jumbotron, Container } from 'react-bootstrap';
import contractAddress from "../contracts/contract-address.json"

export const DepositRedeemExplainer = (props) => {

    return (
        <Jumbotron fluid>
          <Container>
            <h1>Deposit or Redeem Timeshares<small>
              {' '}<Badge variant='warning' size='sm'>BETA</Badge></small></h1>
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
                All code is open source and can be viewed <a href="#">here</a>.
                It has not been professionally audited. If you're a project or
                developer looking to integrate Timeshares, <a href="#">contact us</a>!
            </p>
            {!props.address ?
              <Button size="lg" onClick={props.connectFunc}> Connect wallet </Button>
              : <Button variant="outline-success" disabled>Wallet connected</Button>}
          </Container>
        </Jumbotron>
    )
}
