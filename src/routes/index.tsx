import React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Search from '../pages/Search';
import Post from '../pages/Post';
import Addresses from '../pages/Addresses';
import Address from '../pages/Address';
import NotFoundPage from '../pages/NotFoundPage';

const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/search" component={Search} />
        <Route path="/post/:id" component={Post} />
        <Route path="/addresses" component={Addresses} />
        <Route path="/address/:address" component={Address} />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </Router>
  );
};

export default Routes;
