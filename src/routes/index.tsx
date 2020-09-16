import React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Search from '../pages/Search';
import Post from '../pages/Post';
import Topic from '../pages/Topic';
import Addresses from '../pages/Addresses';
import Address from '../pages/Address';
import NotFoundPage from '../pages/NotFoundPage';
import User from '../pages/User';

const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/search" component={Search} />
        <Route path="/post/:id" component={Post} />
        <Route path="/topic/:id" component={Topic} />
        <Route path="/addresses" component={Addresses} />
        <Route path="/address/:address" component={Address} />
        <Route path="/user/:username" component={User} />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </Router>
  );
};

export default Routes;
