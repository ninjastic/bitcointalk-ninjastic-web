import React from 'react';
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
} from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import { format } from 'date-fns';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { Observer } from 'mobx-react';

import api from '../../services/api';

import Header from '../../components/Header';

import { PageContainer } from './styles';

import { useSearchStore } from '../../stores/SearchStore';

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

  const { setValue, searchQuery, loadingSearch, setLoadingSearch } = store;

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
      const { author, content, topic_id } = searchQuery;

      const { data: responseData } = await api.get(
        `posts/search?author=${author}&content=${content}&topic_id=${topic_id}&last=${lastId}&limit=100`,
      );

      setLoadingSearch(false);

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
      setLoadingSearch(true);
      refetch();
    }
  };

  useBottomScrollListener(() => {
    if (!canFetchMore) return;

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
      <PageContainer>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={24} lg={8}>
            <Card title="Search params" type="inner">
              <Form layout="vertical" size="large">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item label="Author">
                      <Input
                        placeholder="TryNinja"
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
                        onKeyDown={handleKeyDown}
                        onChange={e => setValue('content', e.target.value)}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={
                          isFetching || isLoading || loadingSearch ? (
                            <LoadingOutlined />
                          ) : (
                            <SearchOutlined />
                          )
                        }
                        disabled={isFetching || isLoading || loadingSearch}
                        onClick={() => {
                          setLoadingSearch(true);
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
                return !data || isLoading || loadingSearch ? (
                  <Card
                    title="What do you want to find today?"
                    loading={isLoading || isFetching || loadingSearch}
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
                        Do your search on the card on the side.
                      </Typography.Text>
                    </div>
                  </Card>
                ) : null;
              }}
            </Observer>

            {data && !isLoading && !loadingSearch ? (
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
                      'dd/MM/yyy hh:MM:ss',
                    );

                    const lastBoard = post.boards[post.boards.length - 1];

                    return (
                      <div style={{ marginBottom: 30 }} key={post.post_id}>
                        <Card
                          className="post"
                          title={
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <a
                                href={`https://bitcointalk.org/index.php?topic=${post.topic_id}.msg${post.post_id}#msg${post.post_id}`}
                                style={{
                                  fontWeight: 500,
                                  fontSize: 16,
                                  maxWidth: '50%',
                                  wordWrap: 'break-word',
                                }}
                              >
                                {post.title}
                              </a>
                              <span style={{ fontWeight: 400 }}>
                                posted by{' '}
                                <a
                                  style={{ fontWeight: 500 }}
                                  href={`https://bitcointalk.org/index.php?action=profile;u=${post.author_uid}`}
                                >
                                  {post.author}
                                </a>
                                {post.archive ? ' and scrapped on ' : ' on '}
                                <span style={{ fontWeight: 500 }}>
                                  {formattedDate}{' '}
                                </span>
                                {post.archive ? (
                                  <Tooltip title="This post was scrapped by Loyce at this date. This may or may not represent the time and date the post was made.">
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
                              </span>
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
                              <div>
                                <Link to={`/post/${post.post_id}`}>
                                  {post.post_id}
                                </Link>{' '}
                                (#
                                {groupIndex * 100 + i + 1})
                              </div>
                              <div>{lastBoard}</div>
                            </div>
                          }
                          type="inner"
                        >
                          {parse(DOMPurity.sanitize(post.content))}
                        </Card>
                        {i === array.length - 1 ? (
                          <LoadingMoreCard groupIndex={groupIndex} />
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
      </PageContainer>
    </div>
  );
};

export default Search;
