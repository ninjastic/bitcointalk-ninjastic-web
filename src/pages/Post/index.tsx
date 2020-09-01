import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch, useHistory, Link } from 'react-router-dom';
import { Typography, Card, Tooltip, Collapse, Button } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';

import Header from '../../components/Header';

import { PageContent } from './styles';
import api from '../../services/api';

interface MatchParams {
  id: number;
}

interface PostMatchParams {
  postsId: number[];
}

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

    return (
      <Collapse key={post.post_id}>
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
                  href={`https://bitcointalk.org/index.php?topic=${post.topic_id}.msg${post.post_id}#msg${post.post_id}`}
                  style={{
                    fontWeight: 500,
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
          <div className="post">{parse(DOMPurity.sanitize(post.content))}</div>
        </Collapse.Panel>
      </Collapse>
    );
  });
};

const Post: React.FC = () => {
  const history = useHistory();
  const { id } = useRouteMatch().params as MatchParams;

  const { data, isLoading, isError } = useQuery(
    `post:${id}`,
    async () => {
      const { data: responseData } = await api.get(`posts/${id}`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const {
    data: dataAddresses,
    isLoading: isLoadingAddresses,
    isError: isErrorAddresses,
  } = useQuery(
    `addressesPost:${id}`,
    async () => {
      const { data: responseData } = await api.get(`addresses/post/${id}`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const formattedDate = data
    ? format(new Date(data.date), 'dd/MM/yyyy hh:mm:ss')
    : null;

  const lastBoard = data ? data.boards[data.boards.length - 1] : null;

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
            Post {id}
          </Typography.Title>
        </div>
        {isLoading || isError ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            {isError ? (
              <Typography.Text>
                This post could not be found in our database.
              </Typography.Text>
            ) : (
              <LoadingOutlined style={{ fontSize: 50 }} />
            )}
          </div>
        ) : (
          <div>
            <Card
              className="post"
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
                      <a
                        href={`https://bitcointalk.org/index.php?topic=${data.topic_id}.msg${data.post_id}#msg${data.post_id}`}
                        style={{
                          fontWeight: 500,
                          fontSize: 16,
                          wordWrap: 'break-word',
                        }}
                      >
                        {data.title}
                      </a>
                    </div>
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
                  <div>{lastBoard}</div>
                </div>
              }
              type="inner"
            >
              {parse(DOMPurity.sanitize(data.content))}
            </Card>
            <Card style={{ marginTop: 15, marginBottom: 20 }} title="Addresses">
              {isLoadingAddresses ? (
                <LoadingOutlined style={{ fontSize: 50 }} />
              ) : (
                <div>
                  {isErrorAddresses ? (
                    <Typography.Text>
                      No addresses were found on this post.
                    </Typography.Text>
                  ) : (
                    <div>
                      {dataAddresses.map(address => (
                        <Collapse key={address.address}>
                          <Collapse.Panel
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
                              </div>
                            }
                            key={address.address}
                          >
                            <PostData postsId={address.posts_id} />
                          </Collapse.Panel>
                        </Collapse>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </PageContent>
    </>
  );
};

export default Post;
