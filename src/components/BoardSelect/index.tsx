import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { TreeSelect } from 'antd';
import { autorun } from 'mobx';

import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

interface Props {
  searchQueryField: string;
}

const BoardSelect: React.FC<Props> = ({ searchQueryField }) => {
  const [search, setSearch] = useState('');
  const [boardTitle, setBoardTitle] = useState('');

  const { setValue, searchQuery, setBoards, boards } = useSearchStore();

  const { data, isLoading } = useQuery(
    'boards',
    async () => {
      const { data: responseData } = await api.get('/boards');
      const { data: responseDataRaw } = await api.get('/boards/?raw=1');

      if (responseDataRaw && responseDataRaw.data.length) {
        setBoards(responseDataRaw.data);
      }

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  autorun(() => {
    if (searchQuery[searchQueryField] && boards && !boardTitle) {
      const foundBoard = boards.find(board => board.board_id === Number(searchQuery[searchQueryField]));

      if (foundBoard) setBoardTitle(foundBoard.name);
    }
  });

  const boardTestMatch = (searchText: string, board): boolean => {
    const { title } = board;
    if (title.toLowerCase().startsWith(searchText.toLowerCase())) {
      return true;
    }

    return false;
  };

  const handleOnChange = (selectedValue: string, selectedTitle) => {
    setBoardTitle(selectedTitle[0]);
    setValue(searchQueryField, selectedValue || '');
  };

  return (
    <TreeSelect
      treeDefaultExpandAll
      showSearch
      allowClear
      value={boardTitle || null}
      searchValue={search}
      onChange={handleOnChange}
      onSearch={setSearch}
      filterTreeNode={boardTestMatch}
      treeData={data?.data}
      loading={isLoading}
      placeholder="Bounties (Altcoins)"
    />
  );
};

export default BoardSelect;
