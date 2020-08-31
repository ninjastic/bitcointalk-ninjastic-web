import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Typography, Card, Tooltip, Collapse, Button } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';

import Header from '../../components/Header';

import { PageContent } from './styles';
import api from '../../services/api';

interface MatchParams {
  address: string;
}

interface PostMatchParams {
  id: number;
}

const PostData: React.FC<PostMatchParams> = ({ id }) => {
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
              <div>{lastBoard}</div>
              <div>{id}</div>
            </div>
          </div>
        }
        key={id}
      >
        <div className="post">{parse(DOMPurity.sanitize(data.content))}</div>
      </Collapse.Panel>
    </Collapse>
  );
};

const Address: React.FC = () => {
  const history = useHistory();
  const { address } = useRouteMatch().params as MatchParams;

  const { data, isLoading, isError } = useQuery(
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
            Address {address}
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
              {data.posts_id.map(post_id => (
                <PostData id={post_id} />
              ))}
            </Card>
          </div>
        )}
      </PageContent>
    </>
  );
};

export default Address;
