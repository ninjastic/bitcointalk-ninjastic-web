import React, { useState } from 'react';
import { Menu, Input, Button, Select, Drawer } from 'antd';
import { BulbFilled, MenuOutlined } from '@ant-design/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useThemeSwitcher } from 'react-css-theme-switcher';

import { useSearchStore } from '../../stores/SearchStore';

interface MenuItemsProps {
  mode: 'vertical' | 'horizontal';
}

const HeaderMenu: React.FC<MenuItemsProps> = ({ mode }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { isDarkMode, setIsDarkMode } = useSearchStore();

  const { switcher, themes } = useThemeSwitcher();

  const match = pathname.match(/\/(.*)\/(.*)/);

  const selectDefaultValue = match ? match[1] : 'post';
  const searchDefaultValue = match ? match[2] : '';

  const [searchType, setSearchType] = useState(match ? match[1] : 'post');

  const handleSearch = (e: string) => {
    if (e.trim()) {
      history.push(`/${searchType}/${e.trim()}`);
    }
  };

  const toggleTheme = (value: boolean) => {
    setIsDarkMode(value);
    switcher({ theme: value ? themes.dark : themes.light });
  };

  return (
    <Menu
      mode={mode}
      defaultSelectedKeys={[pathname]}
      style={{
        border: 0,
        width: '100%',
        padding: mode === 'horizontal' ? '0' : '10px',
        margin: mode === 'horizontal' ? 'auto' : 'initial',
        marginTop: mode === 'horizontal' ? '0' : '40px',
        maxWidth: mode === 'horizontal' ? '1300px' : '100%',
        display: mode === 'horizontal' ? 'flex' : 'block',
        background: 'var(--body-background)',
      }}
    >
      <Menu.Item key="/">
        <Link to="/">Ninjastic.space</Link>
      </Menu.Item>
      <Menu.Item key="/search">
        <Link to="/search">Posts</Link>
      </Menu.Item>
      <Menu.Item key="/addresses">
        <Link to="/addresses">Addresses</Link>
      </Menu.Item>
      {/* <Menu.Item key="/patrol">
        <Link to="/patrol">Patrol</Link>
      </Menu.Item> */}
      <Menu.Item
        disabled
        style={{
          marginTop: 6,
          marginBottom: 5,
          marginLeft: mode === 'horizontal' ? 'auto' : '5px',
          marginRight: mode === 'horizontal' ? '0' : '5px',
          left: mode === 'horizontal' ? '-105px' : '0',
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: mode === 'horizontal' ? 'row' : 'column',
          }}
        >
          {isDarkMode ? (
            <Button
              onClick={() => toggleTheme(false)}
              type="text"
              style={{ marginRight: mode === 'horizontal' ? 10 : 0 }}
            >
              <BulbFilled color="#fff" />
            </Button>
          ) : (
            <Button
              onClick={() => toggleTheme(true)}
              type="text"
              style={{ marginRight: mode === 'horizontal' ? 10 : 0 }}
            >
              <BulbFilled color="#000" />
            </Button>
          )}
          <Input.Group style={{ display: 'flex' }} compact>
            <Select defaultValue={selectDefaultValue} onChange={e => setSearchType(e)} style={{ width: 130 }}>
              <Select.Option value="post">Post ID</Select.Option>
              <Select.Option value="topic">Topic ID</Select.Option>
              <Select.Option value="address">Address</Select.Option>
              <Select.Option value="user">Username</Select.Option>
              <Select.Option value="user/id">User ID</Select.Option>
            </Select>
            <Input.Search
              onSearch={handleSearch}
              defaultValue={searchDefaultValue}
              placeholder="Search"
              style={{ height: 32 }}
            />
          </Input.Group>
        </div>
      </Menu.Item>
    </Menu>
  );
};

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);

  const isSmallScreen = useMediaQuery({ query: '(max-width: 850px)' });

  return (
    <div
      className="ant-menu ant-menu-horizontal"
      style={{ marginBottom: 20, height: 48, background: 'var(--body-background)' }}
    >
      {!isSmallScreen ? <HeaderMenu mode="horizontal" /> : null}
      {isSmallScreen ? (
        <div style={{ marginLeft: 5, marginTop: 5 }}>
          <Button type="text" onClick={() => setShowMenu(!showMenu)}>
            <MenuOutlined style={{ fontSize: 20 }} />
          </Button>
        </div>
      ) : null}
      {isSmallScreen && showMenu ? (
        <Drawer
          placement="left"
          open={showMenu}
          onClose={() => setShowMenu(false)}
          bodyStyle={{ padding: 0, background: 'var(--body-background)' }}
        >
          <HeaderMenu mode="vertical" />
        </Drawer>
      ) : null}
    </div>
  );
};

export default Header;
