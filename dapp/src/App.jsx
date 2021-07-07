import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Home from "./pages/home";
import GetStarted from "./pages/getstarted";


export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/getstarted">
            <GetStarted />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
