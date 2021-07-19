import { Breadcrumb } from 'react-bootstrap';
export const Credits = (props) => {

  return (
    <Breadcrumb>
      <Breadcrumb.Item active>
        Jacob Frantz
      </Breadcrumb.Item>
      <Breadcrumb.Item href='https://twitter.com/therealjfrantz'>
        Twitter
      </Breadcrumb.Item>
    </Breadcrumb>
  )
}
