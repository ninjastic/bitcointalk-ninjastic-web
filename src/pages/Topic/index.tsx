import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch, useHistory, Link } from 'react-router-dom';
import {
  Typography,
  Card,
  Tooltip,
  Divider,
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
  id: number;
}

const Topic: React.FC = () => {
  const history = useHistory();
  const { id } = useRouteMatch().params as MatchParams;

  const { data, isLoading, isError } = useQuery(
    `topic:${id}`,
    async () => {
      const { data: responseData } = await api.get(`posts/topic/${id}`);

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
            Topic {id}
          </Typography.Title>
        </div>
        {isLoading || isError ? (
          <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
            {isError ? (
              <Typography.Text>
                This topic could not be found in our database.
              </Typography.Text>
            ) : (
              <LoadingOutlined style={{ fontSize: 50 }} />
            )}
          </div>
        ) : (
          <>
            {data.map((post, i, array) => {
              const formattedDate = data
                ? format(new Date(post.date), 'dd/MM/yyyy hh:mm:ss')
                : null;

              const lastBoard = post
                ? post.boards[post.boards.length - 1]
                : null;

              const postDirection =
                direction(post.content) === 'rtl' ? 'rtl' : 'ltr';

              return (
                <div key={post.post_id}>
                  <ConfigProvider direction={postDirection}>
                    <Card
                      className="post"
                      title={
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
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
                            <span style={{ fontWeight: 400 }}>
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
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Link to={`/post/${post.post_id}`}>
                              {post.post_id}
                            </Link>
                            <div>{lastBoard}</div>
                          </div>
                        </div>
                      }
                      type="inner"
                    >
                      {parse(DOMPurity.sanitize(post.content))}
                    </Card>
                  </ConfigProvider>
                  {i === array.length - 1 ? null : <Divider />}
                </div>
              );
            })}
          </>
        )}
      </PageContent>
    </>
  );
};

export default Topic;
