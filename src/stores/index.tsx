import React from 'react';

import { StoreProvider } from './SearchStore';

const AppProvider: React.FC<any> = ({ children }) => {
  return <StoreProvider>{children}</StoreProvider>;
};

export default AppProvider;
