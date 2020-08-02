import React from 'react';
import '../style.scss';
import {
  BrowserRouter as Router, Route, Switch,
  withRouter,
} from 'react-router-dom';
import { connect } from 'react-redux';
import Counter from './counter';
import Controls from './controls';

const About = (props) => {
  return <div> All there is to know about me </div>;
};

const Welcome = (props) => {
  return <div> Welcome <Counter /></div>;
};

const Test = (props) => {
  return <div> ID: {props.match.params.id} </div>;
};

const FallBack = (props) => {
  return <div>URL Not Found</div>;
};

const Nav = (props) => {
  return (
    <Switch>
      <Route exact path="/" component={Welcome} />
      <Route path="/about" component={About} />
      <Route exact path="/test/:id" component={Test} />
      <Route component={FallBack} />
    </Switch>
  );
};

const App = (props) => {
  return (
    <Router>
      <div>
        <Nav />
        <Route exact path="/" component={Welcome} />
        <Route path="/about" component={About} />
      </div>
    </Router>
  );
};

export default withRouter(connect(null, {})(App));
