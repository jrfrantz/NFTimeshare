
import {
    Link,
  } from "react-router-dom";

export const CTA = (props) => {
    return (
        <Link
        to="/getstarted"
        className='btn btn-custom btn-lg page-scroll'
        >
        Get Started
        </Link>
    );
}
  