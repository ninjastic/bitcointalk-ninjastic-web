import React from 'react';
import { useLocalStore } from 'mobx-react';

type Board = {
  board_id: number;
  name: string;
  parent_id: number;
};

type SearchPostsQuery = {
  author: string;
  content: string;
  title: string;
  topic_id: string;
  after_date: string;
  before_date: string;
  board: string;
  child_boards: boolean;
};

type SearchAddressesQuery = {
  address: string;
  author: string;
  coin: string;
  board: string;
  child_boards: boolean;
};

interface SearchStoreState {
  searchQuery: {
    posts: SearchPostsQuery;
    addresses: SearchAddressesQuery;
  };
  boards: Board[];
  isLoadingSearch: boolean;
  isLoadingAddress: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  setIsLoadingSearch: (value: boolean) => void;
  setIsLoadingAddress: (value: boolean) => void;
  setValue: (type: string, name: string, value: any) => void;
  setBoards: (boards: Board[]) => void;
}

const StoreContext = React.createContext<SearchStoreState>({} as SearchStoreState);

const StoreProvider = ({ children }) => {
  const store = useLocalStore(() => ({
    searchQuery: {
      posts: {
        author: '',
        content: '',
        title: '',
        topic_id: '',
        after_date: '',
        before_date: '',
        board: '',
        child_boards: false,
      },
      addresses: {
        address: '',
        author: '',
        coin: '',
        board: '',
        child_boards: false,
      },
    },
    boards: [],
    isLoadingSearch: false,
    isLoadingAddress: false,
    isDarkMode: localStorage.getItem('ninjastic:isDarkMode') === 'true',

    setIsDarkMode: value => {
      store.isDarkMode = value;
      localStorage.setItem('ninjastic:isDarkMode', value);
    },
    setIsLoadingSearch: value => {
      store.isLoadingSearch = value;
    },
    setIsLoadingAddress: value => {
      store.isLoadingAddress = value;
    },
    setValue: (type, name, value) => {
      store.searchQuery[type][name] = value || null;
    },
    setBoards: (data: Board[]) => {
      store.boards = data;
    },
  }));

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

const useSearchStore = (): SearchStoreState => {
  const store = React.useContext(StoreContext);

  return store;
};

export { StoreProvider, useSearchStore };
