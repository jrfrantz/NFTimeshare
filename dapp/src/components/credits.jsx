import { Breadcrumb } from 'react-bootstrap';
export const Credits = (props) => {

  return (
    <Breadcrumb>
      <Breadcrumb.Item active>
        NFT Timeshares
      </Breadcrumb.Item>
      <Breadcrumb.Item href='https://github.com/jrfrantz/NFTimeshare'>
        Github
      </Breadcrumb.Item>
      <Breadcrumb.Item href='https://discord.gg/Rs9kFZFfFe'>
        Discord
      </Breadcrumb.Item>
    </Breadcrumb>
  )
}
