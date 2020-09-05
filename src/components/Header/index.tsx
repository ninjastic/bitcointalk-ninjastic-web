import React from 'react';
import { Menu, Input } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  const handleTopicSearch = (e: string) => {
    if (e) {
      history.push(`/topic/${e}`);
    }
  };

  const handlePostSearch = (e: string) => {
    if (e) {
      history.push(`/post/${e}`);
    }
  };

  const isSmallScreen = useMediaQuery({ query: '(max-device-width: 620px)' });

  return (
    <div className="ant-menu ant-menu-horizontal" style={{ marginBottom: 20 }}>
      <Menu
        mode={isSmallScreen ? 'inline' : 'horizontal'}
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: 'auto',
          border: 0,
          textAlign: isSmallScreen ? 'center' : 'start',
        }}
        defaultSelectedKeys={[pathname]}
      >
        <Menu.Item key="/">
          <Link to="/">Ninjastic.space</Link>
        </Menu.Item>
        <Menu.Item key="/search">
          <Link to="/search">Search Post</Link>
        </Menu.Item>
        <Menu.Item key="/addresses">
          <Link to="/addresses">Addresses</Link>
        </Menu.Item>
        <Menu.Item
          key="/topic/*"
          disabled
          style={{ float: isSmallScreen ? 'none' : 'right', cursor: 'default' }}
        >
          <Input.Search
            placeholder="Topic ID"
            onSearch={handleTopicSearch}
            style={{ height: 30 }}
          />
        </Menu.Item>
        <Menu.Item
          key="/post/*"
          disabled
          style={{
            float: isSmallScreen ? 'none' : 'right',
            cursor: 'default',
            marginRight: 0,
          }}
        >
          <Input.Search
            placeholder="Post ID"
            onSearch={handlePostSearch}
            style={{ height: 30 }}
          />
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Header;
