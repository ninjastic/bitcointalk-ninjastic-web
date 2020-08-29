import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch } from 'react-router-dom';
import { Typography, Card, Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';

import Header from '../../components/Header';

import { PageContent } from './styles';
import api from '../../services/api';

interface MatchParams {
  id: number;
}

const Post: React.FC = () => {
  const { id } = useRouteMatch().params as MatchParams;

  const { data, isLoading, isError } = useQuery(
    `post:${id}`,
    async () => {
      const { data: responseData } = await api.get(`posts/${id}`);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const formattedDate = data
    ? format(new Date(data.date), 'dd/MM/yyy hh:MM:ss')
    : null;

  const lastBoard = data ? data.boards[data.boards.length - 1] : null;

  return (
    <>
      <Header />
      <PageContent>
        <Typography.Title>Post {id}</Typography.Title>
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
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <a
                    href={`https://bitcointalk.org/index.php?topic=${data.topic_id}.msg${data.post_id}#msg${data.post_id}`}
                    style={{
                      fontWeight: 500,
                      fontSize: 16,
                      maxWidth: '50%',
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
              }
              extra={
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                  }}
                >
                  <div>{data.post_id}</div>
                  <div>{lastBoard}</div>
                </div>
              }
              type="inner"
            >
              {parse(DOMPurity.sanitize(data.content))}
            </Card>
          </div>
        )}
      </PageContent>
    </>
  );
};

export default Post;
