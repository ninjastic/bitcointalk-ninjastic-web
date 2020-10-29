import React from 'react';
import { useQuery } from 'react-query';
import { format, addMinutes } from 'date-fns';
import { useRouteMatch, useHistory, Link } from 'react-router-dom';
import { Typography, Card, Button, Collapse, Tooltip, Row, Col } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';

import Header from '../../components/Header';

import api from '../../services/api';

import { PageContent } from './styles';

const { Text, Title } = Typography;

interface MatchParams {
  address: string;
}

interface Address {
  address: string;
  coin: 'BTC' | 'ETH';
  post_id: number;
  topic_id: number;
  author: string;
  author_uid: number;
  title: string;
  content: string;
  date: string;
  archive: boolean;
  board_id: number;
  board_name: string;
}

interface Data {
  total_results: number;
  addresses: Address[];
}

interface Response {
  data: Data;
}

const Address: React.FC = () => {
  const history = useHistory();
  const { address } = useRouteMatch().params as MatchParams;

  const { data, isLoading, isError } = useQuery<Response>(
    `address:${address}`,
    async () => {
      const { data: responseData } = await api.get('addresses', {
        params: {
          address,
        },
      });

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const authors = [];

  if (data?.data) {
    data.data.addresses.forEach(entry => {
      const found = authors.findIndex(a => a.author === entry.author);
      if (found === -1) {
        authors.push({ author: entry.author, count: 1 });
      } else {
        authors[found].count += 1;
      }
    });
  }

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
          <Title style={{ marginBottom: -5 }}>Address</Title>
        </div>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingOutlined style={{ fontSize: 50 }} />
          </div>
        ) : null}
        {isError ? (
          <Card style={{ display: 'flex', justifyContent: 'center' }}>
            <Text>Something went wrong...</Text>
          </Card>
        ) : null}
        {!isLoading && !isError && !data?.data.total_results ? (
          <Card style={{ display: 'flex', justifyContent: 'center' }}>
            <Text>This address was not found on our database.</Text>
          </Card>
        ) : null}
        {!isLoading && data?.data.total_results ? (
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
                        {data.data.addresses[0].address}
                      </span>
                    </div>
                  </div>
                </div>
              }
              type="inner"
            >
              <Card title="Authors" style={{ marginBottom: 10 }}>
                <Row gutter={[4, 4]}>
                  {authors.map(a => {
                    return (
                      <Col xs={10} lg={4} key={a.author}>
                        <Link
                          to={`/user/${a.author}`}
                          style={{ fontWeight: 500 }}
                        >
                          {a.author} ({a.count})
                        </Link>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
              {data.data.addresses.map(entry => {
                const date = new Date(entry.date);
                const formattedDate = format(
                  addMinutes(date, date.getTimezoneOffset()),
                  'yyyy-MM-dd HH:mm:ss',
                );

                return (
                  <Collapse key={entry.post_id} style={{ marginTop: 15 }}>
                    <Collapse.Panel
                      header={
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div
                            style={{ display: 'flex', flexDirection: 'column' }}
                          >
                            <div>
                              <a
                                href={`https://bitcointalk.org/index.php?topic=${entry.topic_id}.msg${entry.post_id}#msg${entry.post_id}`}
                                style={{
                                  fontWeight: 500,
                                  wordWrap: 'break-word',
                                }}
                              >
                                {entry.title}
                              </a>
                            </div>
                            <span style={{ fontWeight: 400 }}>
                              posted by{' '}
                              <a
                                style={{
                                  fontWeight: 500,
                                }}
                                href={`https://bitcointalk.org/index.php?action=profile;u=${entry.author_uid}`}
                              >
                                {entry.author}
                              </a>
                              {entry.archive ? ' and scraped on ' : ' on '}
                              <span style={{ fontWeight: 500 }}>
                                {formattedDate} UTC{' '}
                              </span>
                              {entry.archive ? (
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
                            <Link to={`/post/${entry.post_id}`}>
                              {entry.post_id}
                            </Link>
                            <div>{entry.board_name}</div>
                          </div>
                        </div>
                      }
                      key={entry.post_id}
                    >
                      <div className="post">
                        {parse(DOMPurity.sanitize(entry.content))}
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                );
              })}
            </Card>
          </div>
        ) : null}
      </PageContent>
    </>
  );
};

export default Address;
