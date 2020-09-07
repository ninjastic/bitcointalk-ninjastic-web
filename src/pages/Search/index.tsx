import React, { useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  Divider,
  BackTop,
  ConfigProvider,
  DatePicker,
} from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { Observer } from 'mobx-react';

import api from '../../services/api';
import direction from '../../services/direction';
import { useSearchStore } from '../../stores/SearchStore';

import Header from '../../components/Header';

import { PageContent } from './styles';

interface Post {
  post_id: number;
  topic_id: number;
  title: string;
  author: string;
  author_uid: number;
  content: string;
  date: Date;
  boards: string[];
  archive: boolean;
}

const Search: React.FC = () => {
  const store = useSearchStore();
  const [postsColumnType] = useState(false);

  const { setValue, searchQuery, isLoadingSearch, setIsLoadingSearch } = store;

  const {
    isLoading,
    isFetching,
    refetch,
    fetchMore,
    canFetchMore,
    data,
  } = useInfiniteQuery<Post[]>(
    'posts',
    async (key, lastId = 0) => {
      const {
        author,
        content,
        topic_id,
        after_date,
        before_date,
      } = searchQuery;

      const { data: responseData } = await api.get(
        `posts?author=${author}&content=${content}&topic_id=${topic_id}&after_date=${after_date}&before_date=${before_date}&last=${lastId}&limit=100`,
      );

      setIsLoadingSearch(false);

      return responseData;
    },
    {
      enabled: false,
      getFetchMore: lastGroup => {
        if (lastGroup.length < 100) return false;

        return lastGroup[lastGroup.length - 1].post_id;
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
    const from = e ? zonedTimeToUtc(new Date(e[0]), 'UTC').toISOString() : '';
    const to = e ? zonedTimeToUtc(new Date(e[1]), 'UTC').toISOString() : '';

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
                        maxLength={50}
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
                        onChange={handleChangeDateRange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={
                          isFetching || isLoading || isLoadingSearch ? (
                            <LoadingOutlined />
                          ) : (
                            <SearchOutlined />
                          )
                        }
                        disabled={isFetching || isLoading || isLoadingSearch}
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
                return !data || isLoading || isLoadingSearch ? (
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

            {data && !isLoading && !isLoadingSearch ? (
              <div>
                {data.map((group, groupIndex) => {
                  if (!group.length) {
                    return (
                      <Typography.Text strong key={1}>
                        No results...
                      </Typography.Text>
                    );
                  }

                  return group.map((post, i, array) => {
                    const formattedDate = format(
                      new Date(post.date),
                      'dd/MM/yyyy hh:mm:ss',
                    );

                    const postDirection = direction(post.content);

                    const lastBoard = post.boards[post.boards.length - 1];

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
                        <ConfigProvider direction={postDirection}>
                          <Card
                            className="post"
                            title={
                              <div>
                                <div>
                                  <a
                                    href={`https://bitcointalk.org/index.php?topic=${post.topic_id}.msg${post.post_id}#msg${post.post_id}`}
                                    style={{
                                      fontWeight: 500,
                                      fontSize: 16,
                                      wordWrap: 'break-word',
                                    }}
                                  >
                                    {post.title}
                                  </a>
                                </div>
                                <div style={{ fontWeight: 400 }}>
                                  posted by{' '}
                                  <a
                                    style={{ fontWeight: 500 }}
                                    href={`https://bitcointalk.org/index.php?action=profile;u=${post.author_uid}`}
                                  >
                                    {post.author}
                                  </a>
                                  {post.archive ? ' and scraped on ' : ' on '}
                                  <span style={{ fontWeight: 500 }}>
                                    {formattedDate}{' '}
                                  </span>
                                  {post.archive ? (
                                    <Tooltip title="This post was scraped by Loyce at this date. This may or may not represent the time and date the post was made.">
                                      <span
                                        style={{
                                          borderBottom: '1px dotted white',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        (archived)
                                      </span>
                                    </Tooltip>
                                  ) : null}
                                </div>
                              </div>
                            }
                            extra={
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-end',
                                }}
                              >
                                <div style={{ textAlign: 'right' }}>
                                  <Link to={`/post/${post.post_id}`}>
                                    {post.post_id}
                                  </Link>{' '}
                                  (#
                                  {groupIndex * 100 + i + 1})
                                  <div>{lastBoard}</div>
                                </div>
                              </div>
                            }
                            type="inner"
                          >
                            {parse(DOMPurity.sanitize(post.content))}
                          </Card>
                        </ConfigProvider>
                        {i === array.length - 1 ? (
                          <>
                            <Divider />
                            <LoadingMoreCard groupIndex={groupIndex} />
                          </>
                        ) : (
                          <Divider />
                        )}
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
