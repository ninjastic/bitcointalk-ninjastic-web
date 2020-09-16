import React from 'react';
import { useLocalStore } from 'mobx-react';

interface Board {
  board_id: number;
  name: string;
  parent_id: number;
}

interface SearchStoreState {
  searchQuery: {
    author: string;
    content: string;
    topic_id: string;
    address: string;
    address_author: string;
    after_date: string;
    before_date: string;
    board: string;
  };
  boards: Board[];
  isLoadingSearch: boolean;
  isLoadingAddress: boolean;
  setIsLoadingSearch: (value: boolean) => void;
  setIsLoadingAddress: (value: boolean) => void;
  setValue: (type: string, value: any) => void;
  setBoards: (boards: Board[]) => void;
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
      address_author: '',
      after_date: '',
      before_date: '',
      board: '',
    },
    boards: [],
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
    setBoards: (data: Board[]) => {
      store.boards = data;
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
