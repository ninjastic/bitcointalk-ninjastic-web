import React from 'react';

import { StoreProvider } from './SearchStore';

const AppProvider: React.FC = ({ children }) => {
  return <StoreProvider>{children}</StoreProvider>;
};

export default AppProvider;
