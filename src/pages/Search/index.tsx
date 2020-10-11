import React, { useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Divider,
  BackTop,
  DatePicker,
  TreeSelect,
  Radio,
} from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { zonedTimeToUtc } from 'date-fns-tz';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { Observer } from 'mobx-react';
import { autorun } from 'mobx';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import numeral from 'numeral';

import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';
import HeaderPostCard from '../../components/HeaderPostCard';
import CompactPostCard from '../../components/CompactPostCard';

import { PageContent } from './styles';

const { Text } = Typography;

interface Post {
  post_id: number;
  topic_id: number;
  title: string;
  author: string;
  author_uid: number;
  content: string;
  date: Date;
  board_id: number;
  board_name: string;
  archive: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Data {
  total_results: number;
  posts: Post[];
}

interface ApiResponse {
  timed_out: boolean;
  result: number;
  data: Data;
}

const SelectorBoards: React.FC = () => {
  const [search, setSearch] = useState('');
  const [boardTitle, setBoardTitle] = useState('');

  const { setValue, setBoards } = useSearchStore();

  const { data, isLoading } = useQuery(
    'boards',
    async () => {
      const { data: responseData } = await api.get('/boards');

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  useQuery(
    'boardsRaw',
    async () => {
      const { data: responseData } = await api.get('/boards/?raw=1');

      if (responseData && responseData.length) {
        setBoards(responseData);
      }

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const boardTestMatch = (searchText: string, board): boolean => {
    const { title } = board;
    if (title.toLowerCase().startsWith(searchText.toLowerCase())) {
      return true;
    }

    return false;
  };

  const handleOnChange = (selectedValue: string, selectedTitle) => {
    setBoardTitle(selectedTitle[0]);
    setValue('board', selectedValue || '');
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
      treeData={data}
      loading={isLoading}
      placeholder="Bounties (Altcoins)"
    />
  );
};

const Search: React.FC = () => {
  const store = useSearchStore();
  const { search } = useLocation();
  const [postsViewType, setPostsViewType] = useState('normal');

  const { setValue, searchQuery, isLoadingSearch, setIsLoadingSearch } = store;

  autorun(() => {
    const query = queryString.parse(search);

    setValue('author', query.author);
    setValue('content', query.content);
    setValue('topic_id', query.topic_id);
    setValue('after_date', query.after_date);
    setValue('before_date', query.before_date);
    setValue('board', query.board);
  });

  const {
    isLoading,
    isFetching,
    isError,
    refetch,
    fetchMore,
    canFetchMore,
    data,
  } = useInfiniteQuery<ApiResponse>(
    'posts',
    async (key, lastId = 0) => {
      const {
        author,
        content,
        topic_id,
        after_date,
        before_date,
        board,
      } = searchQuery;

      const { data: responseData } = await api.get('posts', {
        params: {
          author,
          content,
          topic_id,
          board,
          after_date,
          before_date,
          last: lastId,
          limit: 100,
        },
      });

      setIsLoadingSearch(false);
      return responseData;
    },
    {
      enabled: false,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.posts.length < 100) return false;

        return lastGroup.data.posts[lastGroup.data.posts.length - 1].post_id;
      },
    },
  );

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      setIsLoadingSearch(true);
      refetch();
    }
  };

  const handleChangeDateRange = e => {
    const from =
      e && e[0] ? zonedTimeToUtc(new Date(e[0]), 'UTC').toISOString() : '';

    const to =
      e && e[1] ? zonedTimeToUtc(new Date(e[1]), 'UTC').toISOString() : '';

    setValue('after_date', from);
    setValue('before_date', to);
  };

  useBottomScrollListener(() => {
    if (!canFetchMore || isFetching) return;

    fetchMore();
  }, 500);

  const LoadingMore = ({ groupIndex, onlyIcon = false }) => {
    if (groupIndex === data.length - 1) {
      if (!canFetchMore) {
        return (
          <div style={{ textAlign: 'center', marginTop: 25 }}>
            <Text>You reached the end!</Text>
          </div>
        );
      }

      return onlyIcon ? (
        <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
          <LoadingOutlined style={{ fontSize: 30, color: '#fff' }} />
        </div>
      ) : (
        <Card loading style={{ marginTop: 30 }} />
      );
    }
    return null;
  };

  return (
    <div>
      <Header />
      <PageContent>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={24} lg={8}>
            <Card title="Search params" type="inner">
              <Form layout="vertical" size="large">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="Author">
                      <Input
                        placeholder="TryNinja"
                        defaultValue={searchQuery.author}
                        onKeyDown={handleKeyDown}
                        onChange={e =>
                          setValue('author', e.target.value.trim())
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Topic ID">
                      <Input
                        placeholder="5248878"
                        type="number"
                        min={1}
                        defaultValue={searchQuery.topic_id}
                        onKeyDown={handleKeyDown}
                        onChange={e => setValue('topic_id', e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Content">
                      <Input
                        placeholder="Bitcoin"
                        maxLength={550}
                        defaultValue={searchQuery.content}
                        onKeyDown={handleKeyDown}
                        onChange={e => setValue('content', e.target.value)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item label="Date Range (UTC)">
                      <DatePicker.RangePicker
                        showTime
                        allowEmpty={[true, true]}
                        onChange={handleChangeDateRange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item label="Board">
                      <SelectorBoards />
                    </Form.Item>
                  </Col>

                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={
                          isFetching ||
                          isLoading ||
                          (isLoadingSearch && !isError) ? (
                            <LoadingOutlined style={{ color: '#fff' }} />
                          ) : (
                            <SearchOutlined />
                          )
                        }
                        disabled={
                          isFetching ||
                          isLoading ||
                          (isLoadingSearch && !isError)
                        }
                        onClick={() => {
                          setIsLoadingSearch(true);
                          refetch();
                        }}
                      >
                        Search
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
          <Col xs={24} md={24} lg={16}>
            <Observer>
              {() => {
                return (!data || isLoading || isLoadingSearch) && !isError ? (
                  <Card
                    title="What do you want to find today?"
                    loading={isLoading || isFetching || isLoadingSearch}
                    type="inner"
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Text>Do your search on the card on the side</Text>
                      <Text>or</Text>
                      <Text>
                        Just click the button and get the latest posts.
                      </Text>
                    </div>
                  </Card>
                ) : null;
              }}
            </Observer>
            {isError ? (
              <Card>
                <Text strong key={1}>
                  Something went wrong...
                </Text>
              </Card>
            ) : null}
            {data && !isLoading && !isLoadingSearch && !isError ? (
              <div>
                <div style={{ marginBottom: 15 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {data && !isLoading && !isLoadingSearch ? (
                      <Text>
                        <Text style={{ fontWeight: 500 }}>Total results:</Text>{' '}
                        {numeral(data[0].data.total_results || 0).format('0,0')}
                      </Text>
                    ) : null}
                    <Radio.Group
                      onChange={e => setPostsViewType(e.target.value)}
                      value={postsViewType}
                      defaultValue="normal"
                    >
                      <Radio.Button value="normal">Normal</Radio.Button>
                      <Radio.Button value="header">Header Only</Radio.Button>
                      <Radio.Button value="compact">Compact</Radio.Button>
                    </Radio.Group>
                  </div>
                </div>
                {data.map((group, groupIndex) => {
                  if (!group.data.posts.length) {
                    return (
                      <Card key={groupIndex}>
                        <Text strong key={1}>
                          No results...
                        </Text>
                      </Card>
                    );
                  }

                  return group.data.posts.map((post, i, array) => {
                    switch (postsViewType) {
                      case 'normal':
                        return (
                          <div style={{ marginBottom: 30 }} key={post.post_id}>
                            <PostCard
                              data={post}
                              number={groupIndex * 100 + i + 1}
                            />
                            <Divider />
                            {i === array.length - 1 ? (
                              <LoadingMore groupIndex={groupIndex} />
                            ) : null}
                          </div>
                        );
                      case 'header':
                        return (
                          <div key={post.post_id}>
                            <HeaderPostCard
                              data={post}
                              number={groupIndex * 100 + i + 1}
                              style={{ marginBottom: 15 }}
                            />
                            {i === array.length - 1 ? (
                              <LoadingMore groupIndex={groupIndex} />
                            ) : null}
                          </div>
                        );
                      case 'compact':
                        return (
                          <ul
                            key={post.post_id}
                            style={{ paddingInlineStart: 20, marginBottom: 0 }}
                          >
                            <CompactPostCard
                              data={post}
                              number={groupIndex * 100 + i + 1}
                            />
                            {i === array.length - 1 ? (
                              <LoadingMore groupIndex={groupIndex} onlyIcon />
                            ) : null}
                          </ul>
                        );
                      default:
                        return null;
                    }
                  });
                })}
              </div>
            ) : null}
          </Col>
        </Row>
        <BackTop />
      </PageContent>
    </div>
  );
};

export default Search;
