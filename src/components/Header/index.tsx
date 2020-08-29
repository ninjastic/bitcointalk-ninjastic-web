import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <Menu
      mode="horizontal"
      style={{ marginBottom: 30 }}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/">
        <Link to="/" style={{ marginRight: 15 }}>
          <span>Ninjastic.space</span>
        </Link>
      </Menu.Item>
      <Menu.Item key="/search">
        <Link to="/search">Search</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Header;
