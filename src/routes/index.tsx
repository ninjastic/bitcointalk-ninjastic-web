import React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';
import { useThemeSwitcher } from 'react-css-theme-switcher';

import { LoadingOutlined } from '@ant-design/icons';
import Dashboard from '../pages/Dashboard';
import Search from '../pages/Search';
import Post from '../pages/Post';
import Topic from '../pages/Topic';
import Addresses from '../pages/Addresses';
import Address from '../pages/Address';
import NotFoundPage from '../pages/NotFoundPage';
import User from '../pages/User';
import Patrol from '../pages/Patrol';

const Routes: React.FC = () => {
  const { status } = useThemeSwitcher();

  if (status !== 'loaded') {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingOutlined style={{ fontSize: 64 }} />
      </div>
    );
  }

  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/search" component={Search} />
        <Route path="/post/:id" component={Post} />
        <Route path="/topic/:id" component={Topic} />
        <Route path="/addresses" component={Addresses} />
        <Route path="/address/:address" component={Address} />
        <Route path={['/user/id/:author_uid', '/user/:username']} component={User} />
        <Route path="/patrol" component={Patrol} />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </Router>
  );
};

export default Routes;
