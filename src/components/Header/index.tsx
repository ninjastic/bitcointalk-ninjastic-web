import React from 'react';
import { Menu, Input } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  const handleSearch = (e: string) => {
    if (e) {
      history.push(`/post/${e}`);
    }
  };

  return (
    <div className="ant-menu ant-menu-horizontal" style={{ marginBottom: 25 }}>
      <Menu
        mode="horizontal"
        style={{
          maxWidth: 1200,
          margin: 'auto',
          border: 0,
        }}
        defaultSelectedKeys={[pathname]}
      >
        <Menu.Item key="/">
          <Link to="/" style={{ marginRight: 15 }}>
            <span>Ninjastic.space</span>
          </Link>
        </Menu.Item>
        <Menu.Item key="/search">
          <Link to="/search">Search Post</Link>
        </Menu.Item>
        <Menu.Item key="/addresses">
          <Link to="/addresses">Addresses</Link>
        </Menu.Item>
        <Menu.Item
          key="/post/*"
          disabled
          style={{ float: 'right', cursor: 'default' }}
        >
          <Input.Search placeholder="Post ID" onSearch={handleSearch} />
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Header;
