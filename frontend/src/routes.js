import React from 'react';

import { Route, Switch, Link } from 'react-router-dom';
import App from './containers/App';
import LandingPage from './containers/LandingPage';
import UserPage from './containers/UserPage';

import Header from './components/Header';

const Routes = () => (
  <App>
    <Header />
    {/* <Link to="/inbox">GoInbox</Link> */}
    <Switch>
    <Route path="/user/:id" component={UserPage} />
    <Route path="/" component={LandingPage} />

    </Switch>
  </App>
);

export default Routes;
