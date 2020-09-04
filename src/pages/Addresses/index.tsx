import React from 'react';
import { useQuery } from 'react-query';
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
  BackTop,
  Collapse,
  ConfigProvider,
} from 'antd';
import { format } from 'date-fns';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import { Observer } from 'mobx-react';

import api from '../../services/api';
import direction from '../../services/direction';
import { useSearchStore } from '../../stores/SearchStore';

import Header from '../../components/Header';

import { PageContent } from './styles';

interface Address {
  coin: string;
  address: string;
  posts_id: number[];
  created_at: Date;
  updated_at: Date;
}

interface PostMatchParams {
  postsId: number[];
}

interface AuthorsMatchParams {
  address: string;
}

const textToColor = (text: string) => {
  let hash = 0;
  if (text.length === 0) return hash;
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash;
  }
  const rgb = [0, 0, 0];
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 255;
    rgb[i] = value;
  }
  return `hsl(${rgb[1]},  100%, 75%)`;
};

const AuthorsData: React.FC<AuthorsMatchParams> = ({ address }) => {
  const { data, isLoading, isError } = useQuery(
    `addressesAuthors:${address}`,
    async () => {
      const { data: responseData } = await api.get(
        `addresses/${address}/authors`,
      );

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading || isError) {
    return <></>;
  }

  return (
    <Card type="inner" title="Users">
      {data.map(entry => (
        <div key={entry.author}>
          <a
            href={`https://bitcointalk.org/index.php?action=profile;u=${entry.author_uid}`}
            style={{ color: `${textToColor(entry.author)}` }}
          >
            {entry.author} ({entry.posts_id.length})
          </a>
        </div>
      ))}
    </Card>
  );
};

const PostData: React.FC<PostMatchParams> = ({ postsId }) => {
  const ids = postsId.reduce((prev, current, i, array) => {
    if (i === 0) {
      return current;
    }
    if (i === array.length - 1) {
      return `${prev},${current}`;
    }
    return `${prev},${current}`;
  }, '');

  const { data, isLoading, isError } = useQuery(
    `addressesPostsData:${ids}`,
    async () => {
      const { data: responseData } = await api.get(`posts/${ids}`);

      if (responseData.post_id) {
        return [responseData];
      }

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <Collapse>
        <Collapse.Panel header={<LoadingOutlined />} key={ids} />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Collapse>
        <Collapse.Panel
          header={`Error loading posts ${ids}`}
          key={ids}
          disabled
        />
      </Collapse>
    );
  }

  return data.map(post => {
    const formattedDate = post
      ? format(new Date(post.date), 'dd/MM/yyyy hh:mm:ss')
      : null;

    const lastBoard = post.boards[post.boards.length - 1];
    const postDirection = direction(post.content) === 'rtl' ? 'rtl' : 'ltr';

    return (
      <ConfigProvider direction={postDirection} key={post.post_id}>
        <Collapse>
          <Collapse.Panel
            header={
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div>
                    <a
                      href={`https://bitcointalk.org/index.php?topic=${post.topic_id}.msg${post.post_id}#msg${post.post_id}`}
                      style={{
                        fontWeight: 500,
                        wordWrap: 'break-word',
                      }}
                    >
                      {post.title}
                    </a>
                  </div>
                  <span style={{ fontWeight: 400 }}>
                    posted by{' '}
                    <a
                      style={{
                        fontWeight: 500,
                        color: `${textToColor(post.author)}`,
                      }}
                      href={`https://bitcointalk.org/index.php?action=profile;u=${post.author_uid}`}
                    >
                      {post.author}
                    </a>
                    {post.archive ? ' and scrapped on ' : ' on '}
                    <span style={{ fontWeight: 500 }}>{formattedDate} </span>
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
                <div style={{ textAlign: 'right' }}>
                  <Link to={`/post/${post.post_id}`}>{post.post_id}</Link>
                  <div>{lastBoard}</div>
                </div>
              </div>
            }
            key={post.id}
          >
            <div className="post">
              {parse(DOMPurity.sanitize(post.content))}
            </div>
          </Collapse.Panel>
        </Collapse>
      </ConfigProvider>
    );
  });
};

const Addresses: React.FC = () => {
  const store = useSearchStore();

  const {
    setValue,
    searchQuery,
    isLoadingAddress,
    setIsLoadingAddress,
  } = store;

  const { isLoading, isFetching, refetch, data } = useQuery<Address[]>(
    'addresses',
    async () => {
      const { address } = searchQuery;

      const { data: responseData } = await api.get(
        `addresses?address=${address}&limit=50`,
      );

      setIsLoadingAddress(false);

      return responseData;
    },
    {
      enabled: false,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      setIsLoadingAddress(true);
      refetch();
    }
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
                  <Col span={24}>
                    <Form.Item label="Address">
                      <Input
                        placeholder="1NinjabXd5znM5zgTcmxDVzH4w3nbaY16L"
                        onKeyDown={handleKeyDown}
                        defaultValue={searchQuery.address}
                        onChange={e =>
                          setValue('address', e.target.value.trim())
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={
                          isFetching || isLoading || isLoadingAddress ? (
                            <LoadingOutlined />
                          ) : (
                            <SearchOutlined />
                          )
                        }
                        disabled={isFetching || isLoading || isLoadingAddress}
                        onClick={() => {
                          setIsLoadingAddress(true);
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
                return !data || isLoading || isLoadingAddress ? (
                  <Card
                    title="What do you want to find today?"
                    loading={isLoading || isFetching || isLoadingAddress}
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
                      <Typography.Text style={{ textAlign: 'center' }}>
                        Just click the button and get a few random addresses.
                      </Typography.Text>
                    </div>
                  </Card>
                ) : null;
              }}
            </Observer>

            {data && !isLoading && !isLoadingAddress ? (
              <div>
                {!data.length ? (
                  <Typography.Text strong key={1}>
                    No results...
                  </Typography.Text>
                ) : null}
                {data.map((address, index) => {
                  return (
                    <div style={{ marginBottom: 15 }} key={address.address}>
                      <Collapse>
                        <Collapse.Panel
                          key={address.address}
                          header={
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                wordWrap: 'break-word',
                                maxWidth: '100%',
                              }}
                            >
                              <Link
                                to={`/address/${address.address}`}
                                style={{
                                  fontWeight: 500,
                                  wordWrap: 'break-word',
                                  maxWidth: '90%',
                                }}
                              >
                                {address.address} [{address.coin}] (
                                {address.posts_id.length})
                              </Link>

                              <div>
                                (#
                                {index + 1})
                              </div>
                            </div>
                          }
                        >
                          <div style={{ marginBottom: 10 }}>
                            <AuthorsData address={address.address} />
                          </div>
                          <PostData postsId={address.posts_id} />
                        </Collapse.Panel>
                      </Collapse>
                    </div>
                  );
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

export default Addresses;
