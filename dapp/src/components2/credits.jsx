import { Breadcrumb } from 'react-bootstrap';
export const Credits = (props) => {

  return (
    <Breadcrumb>
      <Breadcrumb.Item active>
        NFT Timeshares
      </Breadcrumb.Item>
      <Breadcrumb.Item href='https://twitter.com/therealjfrantz'>
        Twitter
      </Breadcrumb.Item>
      <Breadcrumb.Item href='https://github.com/jrfrantz/NFTimeshare'>
        Github
      </Breadcrumb.Item>
    </Breadcrumb>
  )
}
