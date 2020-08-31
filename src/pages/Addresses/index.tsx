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
} from 'antd';
import { format } from 'date-fns';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import { Observer } from 'mobx-react';

import api from '../../services/api';
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

interface MatchParams {
  id: number;
}

const PostData: React.FC<MatchParams> = ({ id }) => {
  const { data, isLoading, isError } = useQuery(
    `addressesPostsData:${id}`,
    async () => {
      const { data: responseData } = await api.get(`posts/${id}`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <Collapse>
        <Collapse.Panel header={<LoadingOutlined />} key={id} />
      </Collapse>
    );
  }

  if (isError) {
    return (
      <Collapse>
        <Collapse.Panel header={`Error loading post ${id}`} key={id} disabled />
      </Collapse>
    );
  }

  const formattedDate = data
    ? format(new Date(data.date), 'dd/MM/yyy hh:MM:ss')
    : null;

  const lastBoard = data ? data.boards[data.boards.length - 1] : null;

  return (
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
              <a
                href={`https://bitcointalk.org/index.php?topic=${data.topic_id}.msg${data.post_id}#msg${data.post_id}`}
                style={{
                  fontWeight: 500,
                  wordWrap: 'break-word',
                }}
              >
                {data.title}
              </a>
              <span style={{ fontWeight: 400 }}>
                posted by{' '}
                <a
                  style={{ fontWeight: 500 }}
                  href={`https://bitcointalk.org/index.php?action=profile;u=${data.author_uid}`}
                >
                  {data.author}
                </a>
                {data.archive ? ' and scrapped on ' : ' on '}
                <span style={{ fontWeight: 500 }}>{formattedDate} </span>
                {data.archive ? (
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
              <Link to={`/post/${id}`}>{id}</Link>
              <div>{lastBoard}</div>
            </div>
          </div>
        }
        key={id}
      >
        <div>{parse(DOMPurity.sanitize(data.content))}</div>
      </Collapse.Panel>
    </Collapse>
  );
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
                        Do your search on the card on the side OR get 50 random
                        addresses.
                      </Typography.Text>
                    </div>
                  </Card>
                ) : null;
              }}
            </Observer>

            {data && !isLoading && !isLoadingAddress ? (
              <div>
                {data.map((address, index) => {
                  if (!data.length) {
                    return (
                      <Typography.Text strong key={1}>
                        No results...
                      </Typography.Text>
                    );
                  }

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
                              }}
                            >
                              <Link
                                to={`/address/${address.address}`}
                                style={{
                                  fontWeight: 500,
                                  wordWrap: 'break-word',
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
                          {address.posts_id.map(post_id => (
                            <PostData id={post_id} key={post_id} />
                          ))}
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
