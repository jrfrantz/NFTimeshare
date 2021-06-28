import React from "react";
import ReactDOM from "react-dom";
import { Dapp } from "./components/Dapp";
import { TokenURI } from "./components/TokenURI";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

// We import bootstrap here, but you can remove if you want
import "bootstrap/dist/css/bootstrap.css";
var path = require('path');

// This is the entry point of your application, but it just renders the Dapp
// react component. All of the logic is contained in it.

ReactDOM.render(
  <React.StrictMode>
  <Router>
    <Switch>
      <Route exact path="/">
        <Dapp />
      </Route>
      <Route exact path="/tokenURI/:tokenId">
        <TokenURI />
      </Route>
    </Switch>
  </Router>
  </React.StrictMode>,

  document.getElementById("root")
);
