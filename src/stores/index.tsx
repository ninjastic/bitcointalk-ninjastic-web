import React from 'react';

import { StoreProvider } from './SearchStore';

const AppProvider: React.FC<any> = ({ children }) => <StoreProvider>{children}</StoreProvider>;

export default AppProvider;
