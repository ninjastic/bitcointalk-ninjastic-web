import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch, useHistory, Link } from 'react-router-dom';
import {
  Typography,
  Card,
  Tooltip,
  Collapse,
  Button,
  ConfigProvider,
} from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';

import Header from '../../components/Header';

import api from '../../services/api';
import direction from '../../services/direction';

import { PageContent } from './styles';

interface MatchParams {
  address: string;
}

interface PostMatchParams {
  postsId: number[];
}

interface Address {
  address: string;
  coin: 'BTC' | 'ETH';
  posts_id: number[];
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

const AuthorsData: React.FC = () => {
  const { address } = useRouteMatch().params as MatchParams;

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
    const postDirection = direction(post.content);

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

const Address: React.FC = () => {
  const history = useHistory();
  const { address } = useRouteMatch().params as MatchParams;

  const { data, isLoading, isError } = useQuery<Address>(
    `address:${address}`,
    async () => {
      const { data: responseData } = await api.get(`addresses/${address}`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  return (
    <>
      <Header />
      <PageContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
          }}
        >
          <Button type="link" onClick={() => history.goBack()}>
            <ArrowLeftOutlined style={{ fontSize: 32 }} />
          </Button>
          <Typography.Title style={{ marginBottom: -5 }}>
            Address
          </Typography.Title>
        </div>
        {isLoading || isError ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            {isError ? (
              <Typography.Text>
                This address could not be found in our database.
              </Typography.Text>
            ) : (
              <LoadingOutlined style={{ fontSize: 50 }} />
            )}
          </div>
        ) : (
          <div>
            <Card
              title={
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: 16,
                          wordWrap: 'break-word',
                        }}
                      >
                        {data.address}
                      </span>
                    </div>
                  </div>
                </div>
              }
              type="inner"
            >
              <div style={{ marginBottom: 10 }}>
                <AuthorsData />
              </div>
              <PostData postsId={data.posts_id} />
            </Card>
          </div>
        )}
      </PageContent>
    </>
  );
};

export default Address;
