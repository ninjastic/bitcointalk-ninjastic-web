import React, { useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import { Link } from 'react-router-dom';
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
} from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { format, addMinutes } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { Observer } from 'mobx-react';
import numeral from 'numeral';

import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';

import { PageContent } from './styles';

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
}

interface ApiResponseHitsData {
  _id: string;
  _source: Post;
}

interface ApiResponseHits {
  hits: ApiResponseHitsData[];
  total: {
    value: number;
  };
}

interface ApiResponse {
  took: number;
  timed_out: boolean;
  hits: ApiResponseHits;
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
  const [postsColumnType] = useState(false);

  const { setValue, searchQuery, isLoadingSearch, setIsLoadingSearch } = store;

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

      const { data: responseData } = await api.get(
        `posts?author=${author}&content=${content}&topic_id=${topic_id}&board=${board}&after_date=${after_date}&before_date=${before_date}&last=${lastId}&limit=100`,
      );

      setIsLoadingSearch(false);
      return responseData;
    },
    {
      enabled: false,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (lastGroup.hits.hits.length < 100) return false;

        return lastGroup.hits.hits[lastGroup.hits.hits.length - 1]._id;
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

  const LoadingMoreCard = ({ groupIndex }) => {
    if (groupIndex === data.length - 1) {
      return canFetchMore ? (
        <Card loading style={{ marginTop: 30 }} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: 25 }}>
          <Typography.Text>You reached the end!</Typography.Text>
        </div>
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
            {data &&
            data[0].hits.hits.length &&
            !isLoading &&
            !isLoadingSearch ? (
              <div style={{ marginTop: 10, float: 'right' }}>
                <Typography.Text>
                  <Typography.Text style={{ fontWeight: 500 }}>
                    Total results:
                  </Typography.Text>{' '}
                  {numeral(data[0].hits.total.value).format('0,0')}
                </Typography.Text>
              </div>
            ) : null}
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
                      <Typography.Text>
                        Do your search on the card on the side
                      </Typography.Text>
                      <Typography.Text>or</Typography.Text>
                      <Typography.Text>
                        Just click the button and get the latest posts.
                      </Typography.Text>
                    </div>
                  </Card>
                ) : null;
              }}
            </Observer>
            {isError ? (
              <div>
                <Typography.Text strong key={1}>
                  Something went wrong...
                </Typography.Text>
              </div>
            ) : null}
            {data && !isLoading && !isLoadingSearch && !isError ? (
              <div>
                {data.map((group, groupIndex) => {
                  if (!group.hits.hits.length) {
                    return (
                      <Typography.Text strong key={1}>
                        No results...
                      </Typography.Text>
                    );
                  }

                  return group.hits.hits.map((post_raw, i, array) => {
                    const post = post_raw._source;

                    const date = new Date(post.date);

                    const formattedDate = format(
                      addMinutes(date, date.getTimezoneOffset()),
                      'yyyy-MM-dd HH:mm:ss',
                    );

                    return postsColumnType ? (
                      <div style={{ marginBottom: 15 }} key={post.post_id}>
                        <Card>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <a
                              href={`https://bitcointalk.org/index.php?topic=${post.topic_id}.msg${post.post_id}#msg${post.post_id}`}
                              style={{
                                fontWeight: 500,
                                wordWrap: 'break-word',
                              }}
                            >
                              {post.title}
                            </a>

                            <div style={{ textAlign: 'right' }}>
                              <Link to={`/post/${post.post_id}`}>
                                {post.post_id}
                              </Link>{' '}
                              (#
                              {groupIndex * 100 + i + 1})
                            </div>
                          </div>

                          <div>
                            Posted by{' '}
                            <a
                              style={{ fontWeight: 500 }}
                              href={`https://bitcointalk.org/index.php?action=profile;u=${post.author_uid}`}
                            >
                              {post.author}
                            </a>
                            {post.archive ? ' and scraped on ' : ' on '}
                            <span style={{ fontWeight: 500 }}>
                              {formattedDate}
                            </span>
                          </div>
                        </Card>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 30 }} key={post.post_id}>
                        <PostCard
                          data={post}
                          number={groupIndex * 100 + i + 1}
                        />
                        <Divider />
                        {i === array.length - 1 ? (
                          <LoadingMoreCard groupIndex={groupIndex} />
                        ) : null}
                      </div>
                    );
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
