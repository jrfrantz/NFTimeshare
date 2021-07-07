import { Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const TimeshareJumbotron = (props) => {
  console.log(props);
  return (
    <Jumbotron>
      <h1>Bring the vacation lifestyle to your NFTs</h1>
      <h5>Own an entire NFT -- for a month each year.</h5>
    <Link to='/getstarted'>
      <Button>
        Get started
      </Button>
    </Link>
    </Jumbotron>
  );
}
