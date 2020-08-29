import React from 'react';
import { useLocalStore } from 'mobx-react';

interface SearchStoreState {
  searchQuery: {
    author: string;
    content: string;
    topic_id: string;
  };
  loadingSearch: boolean;
  setLoadingSearch: (value: boolean) => void;
  setValue: (type: string, value: any) => void;
}

const StoreContext = React.createContext<SearchStoreState>(
  {} as SearchStoreState,
);

const StoreProvider = ({ children }) => {
  const store = useLocalStore(() => ({
    searchQuery: {
      author: '',
      content: '',
      topic_id: '',
    },
    loadingSearch: false,
    setLoadingSearch: value => {
      store.loadingSearch = value;
    },
    setValue: (type, value) => {
      store.searchQuery[type] = value;
    },
  }));

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

const useSearchStore = (): SearchStoreState => {
  const store = React.useContext(StoreContext);

  return store;
};

export { StoreProvider, useSearchStore };
