import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

export function TokenURI() {
  return (
    JSON.stringify(
      {x: "3"}
    )
  );
}
