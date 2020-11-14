import 'mobx-react/batchingForReactDom';
import React from 'react';
import { ThemeSwitcherProvider } from 'react-css-theme-switcher';

import GlobalStyles from './styles/global';

import Routes from './routes';

import AppProvider from './stores';

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

function App() {
  return (
    <AppProvider>
      <ThemeSwitcherProvider
        themeMap={themes}
        defaultTheme={localStorage.getItem('ninjastic:isDarkMode') === 'true' ? 'dark' : 'light'}
      >
        <Routes />
        <GlobalStyles />
      </ThemeSwitcherProvider>
    </AppProvider>
  );
}

export default App;
