import React from 'react';
import { useLocalStore } from 'mobx-react';

interface SearchStoreState {
  searchQuery: {
    author: string;
    content: string;
    topic_id: string;
    address: string;
    after_date: string;
    before_date: string;
  };
  isLoadingSearch: boolean;
  isLoadingAddress: boolean;
  setIsLoadingSearch: (value: boolean) => void;
  setIsLoadingAddress: (value: boolean) => void;
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
      address: '',
      after_date: '',
      before_date: '',
    },
    isLoadingSearch: false,
    isLoadingAddress: false,
    setIsLoadingSearch: value => {
      store.isLoadingSearch = value;
    },
    setIsLoadingAddress: value => {
      store.isLoadingAddress = value;
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
