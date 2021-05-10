import React, { useState } from 'react';
import { Input, Form, Col, Row, Button, Card, Typography, Collapse, Divider } from 'antd';
import { useQuery } from 'react-query';
import parse from 'html-react-parser';
import DOMPurity from 'dompurify';
import { Link } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';

import api from '../../services/api';

import imageBTC from '../../assets/images/btc.png';
import imageETH from '../../assets/images/eth.png';

import Header from '../../components/Header';

import { PageContent } from './styles';

const Compare: React.FC = () => {
  const [firstAuthorUid, setFirstAuthorUid] = useState('');
  const [secondAuthorUid, setSecondAuthorUid] = useState('');

  const [firstAuthor, setFirstAuthor] = useState('');
  const [secondAuthor, setSecondAuthor] = useState('');

  const icons = [
    {
      coin: 'ETH',
      image: imageETH,
    },
    {
      coin: 'BTC',
      image: imageBTC,
    },
  ];

  const { data, refetch, isLoading, isFetching } = useQuery(
    'compare',
    async () => {
      const { data: responseData } = await api.get('/compare', {
        params: {
          firstAuthorUid,
          secondAuthorUid,
        },
      });

      const { data: firstAuthorData } = await api.get(`/users/id/${firstAuthorUid}`);
      const { data: secondAuthorData } = await api.get(`/users/id/${secondAuthorUid}`);

      setFirstAuthor(firstAuthorData.data.author);
      setSecondAuthor(secondAuthorData.data.author);

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, enabled: false },
  );

  const handleCompare = () => {
    refetch();
  };

  return (
    <>
      <Header />
      <PageContent>
        <Card title="Compare two users" style={{ marginBottom: 20 }}>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Form.Item>
                <Input
                  placeholder="First User Id"
                  size="large"
                  onChange={e => setFirstAuthorUid(e.target.value)}
                  value={firstAuthorUid}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Input
                placeholder="Second User Id"
                size="large"
                onChange={e => setSecondAuthorUid(e.target.value)}
                value={secondAuthorUid}
              />
            </Col>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button size="large" onClick={handleCompare}>
                Compare
              </Button>
            </Col>
            <Col span={24}>
              <Typography.Title level={5}>Available Data:</Typography.Title>
              <Typography.Paragraph>
                - BTC and ETH addresses posted outside of quotes on the &quot;Stake Bitcoin address here&quot; topic, on
                the &quot;Bounties (Altcoin)&quot; and &quot;Services&quot; board.
              </Typography.Paragraph>
              <Typography.Paragraph>
                - All Telegram, Twitter and Facebook socials and in common posted on the &quot;Bounties (Altcoin)&quot;
                and &quot;Services&quot; board.
              </Typography.Paragraph>
            </Col>
          </Row>
        </Card>
        {isLoading || isFetching ? (
          <div style={{ width: '100%', marginTop: 10, textAlign: 'center' }}>
            <LoadingOutlined style={{ fontSize: 32 }} />
          </div>
        ) : null}
        {!isLoading && !isFetching && data ? (
          <Row gutter={[24, 32]}>
            <Col span={24}>
              <Collapse defaultActiveKey="1">
                <Collapse.Panel header="Addresses In Common" key="1">
                  {!data.addresses.length ? (
                    <Typography.Text type="secondary">Nothing was found...</Typography.Text>
                  ) : null}
                  {data.addresses.map((address, index, array) => (
                    <Row gutter={[24, 32]} key={address.address}>
                      <Col span={24}>
                        <div style={{ display: 'flex' }}>
                          <img
                            height={24}
                            width={24}
                            src={icons.find(i => i.coin === address.coin)?.image}
                            alt={address.coin}
                            style={{ marginRight: 5 }}
                          />
                          <Link to={`/address/${address.address}`} style={{ fontSize: 20, fontWeight: 500 }}>
                            {address.address}
                          </Link>
                          <div style={{ marginLeft: 15 }}>
                            {address.coin === 'BTC' ? (
                              <a href={`https://blockchair.com/bitcoin/address/${address.address}`}>(Explorer)</a>
                            ) : null}
                            {address.coin === 'ETH' ? (
                              <a href={`https://etherscan.io/address/${address.address}`}>(Explorer)</a>
                            ) : null}
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <Typography.Title level={5}>{firstAuthor}</Typography.Title>
                        <Collapse>
                          {address.first.map(a => (
                            <Collapse.Panel
                              header={
                                <a
                                  href={`https://bitcointalk.org/index.php?topic=${a.topic_id}.msg${a.post_id}#msg${a.post_id}`}
                                >
                                  {a.title.substring(0, 65)}
                                  {a.title.length > 50 ? '...' : ''}
                                </a>
                              }
                              key={a.post_id}
                            >
                              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                {parse(DOMPurity.sanitize(a.content))}
                              </div>
                            </Collapse.Panel>
                          ))}
                        </Collapse>
                        {address.first.length === 10 ? (
                          <div style={{ textAlign: 'right', marginTop: 10 }}>
                            <Link to={`/addresses?author=${firstAuthor}&address=${address.address}`}>
                              View all results
                            </Link>
                          </div>
                        ) : null}
                      </Col>
                      <Col span={12}>
                        <Typography.Title level={5}>{secondAuthor}</Typography.Title>
                        <Collapse>
                          {address.second.map(a => (
                            <Collapse.Panel
                              header={
                                <a
                                  href={`https://bitcointalk.org/index.php?topic=${a.topic_id}.msg${a.post_id}#msg${a.post_id}`}
                                >
                                  {a.title.substring(0, 65)}
                                  {a.title.length > 50 ? '...' : ''}
                                </a>
                              }
                              key={a.post_id}
                            >
                              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                {parse(DOMPurity.sanitize(a.content))}
                              </div>
                            </Collapse.Panel>
                          ))}
                        </Collapse>
                        {address.second.length === 10 ? (
                          <div style={{ textAlign: 'right', marginTop: 10 }}>
                            <Link to={`/addresses?author=${secondAuthor}&address=${address.address}`}>
                              View all results
                            </Link>
                          </div>
                        ) : null}
                      </Col>
                      {index < array.length - 1 ? <Divider /> : null}
                    </Row>
                  ))}
                </Collapse.Panel>
              </Collapse>
            </Col>
            <Col span={24}>
              <Collapse defaultActiveKey="1">
                <Collapse.Panel header="Socials In Common" key="1">
                  <Col span={24}>
                    <Typography.Title level={4}>Telegram:</Typography.Title>
                    {data.socials.telegram ? (
                      <div>
                        <Typography.Text code>{data.socials.telegram.name}</Typography.Text>
                        <Row gutter={24} style={{ marginTop: 15 }}>
                          <Col span={12}>
                            <Typography.Title level={5}>{firstAuthor}</Typography.Title>
                            <Collapse>
                              {data.socials.telegram.first.map(t => (
                                <Collapse.Panel
                                  header={
                                    <a
                                      href={`https://bitcointalk.org/index.php?topic=${t.topic_id}.msg${t.post_id}#msg${t.post_id}`}
                                    >
                                      {t.title.substring(0, 65)}
                                      {t.title.length > 50 ? '...' : ''}
                                    </a>
                                  }
                                  key={t.post_id}
                                >
                                  <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                    {parse(DOMPurity.sanitize(t.content))}
                                  </div>
                                </Collapse.Panel>
                              ))}
                            </Collapse>
                            {data.socials.telegram.first.length === 10 ? (
                              <div style={{ textAlign: 'right', marginTop: 10 }}>
                                <Link to={`/search?author=${firstAuthor}&content=${data.socials.telegram.name}`}>
                                  View all results
                                </Link>
                              </div>
                            ) : null}
                          </Col>
                          <Col span={12}>
                            <Typography.Title level={5}>{secondAuthor}</Typography.Title>
                            <Collapse>
                              {data.socials.telegram.second.map(t => (
                                <Collapse.Panel
                                  header={
                                    <a
                                      href={`https://bitcointalk.org/index.php?topic=${t.topic_id}.msg${t.post_id}#msg${t.post_id}`}
                                    >
                                      {t.title.substring(0, 65)}
                                      {t.title.length > 50 ? '...' : ''}
                                    </a>
                                  }
                                  key={t.post_id}
                                >
                                  <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                    {parse(DOMPurity.sanitize(t.content))}
                                  </div>
                                </Collapse.Panel>
                              ))}
                            </Collapse>
                            {data.socials.telegram.second.length === 10 ? (
                              <div style={{ textAlign: 'right', marginTop: 10 }}>
                                <Link to={`/search?author=${secondAuthor}&content=${data.socials.telegram.name}`}>
                                  View all results
                                </Link>
                              </div>
                            ) : null}
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <Typography.Text type="secondary">Nothing was found...</Typography.Text>
                    )}
                  </Col>
                  <Divider />
                  <Col span={24}>
                    <Typography.Title level={4}>Twitter:</Typography.Title>
                    {data.socials.twitter ? (
                      <div>
                        <div style={{ display: 'flex' }}>
                          <Typography.Text code>{data.socials.twitter.name}</Typography.Text>
                          <a
                            href={`https://twitter.com/${data.socials.twitter.name}`}
                            style={{ marginLeft: 15, fontSize: 14 }}
                          >
                            (Profile URL)
                          </a>
                        </div>
                        <Row gutter={24} style={{ marginTop: 15 }}>
                          <Col span={12}>
                            <Typography.Title level={5}>{firstAuthor}</Typography.Title>
                            <Collapse>
                              {data.socials.twitter.first.map(t => (
                                <Collapse.Panel
                                  header={
                                    <a
                                      href={`https://bitcointalk.org/index.php?topic=${t.topic_id}.msg${t.post_id}#msg${t.post_id}`}
                                    >
                                      {t.title.substring(0, 65)}
                                      {t.title.length > 50 ? '...' : ''}
                                    </a>
                                  }
                                  key={t.post_id}
                                >
                                  <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                    {parse(DOMPurity.sanitize(t.content))}
                                  </div>
                                </Collapse.Panel>
                              ))}
                            </Collapse>
                            {data.socials.twitter.first.length === 10 ? (
                              <div style={{ textAlign: 'right', marginTop: 10 }}>
                                <Link to={`/search?author=${firstAuthor}&content=${data.socials.twitter.name}`}>
                                  View all results
                                </Link>
                              </div>
                            ) : null}
                          </Col>
                          <Col span={12}>
                            <Typography.Title level={5}>{secondAuthor}</Typography.Title>
                            <Collapse>
                              {data.socials.twitter.second.map(t => (
                                <Collapse.Panel
                                  header={
                                    <a
                                      href={`https://bitcointalk.org/index.php?topic=${t.topic_id}.msg${t.post_id}#msg${t.post_id}`}
                                    >
                                      {t.title.substring(0, 65)}
                                      {t.title.length > 50 ? '...' : ''}
                                    </a>
                                  }
                                  key={t.post_id}
                                >
                                  <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                    {parse(DOMPurity.sanitize(t.content))}
                                  </div>
                                </Collapse.Panel>
                              ))}
                            </Collapse>
                            {data.socials.twitter.second.length === 10 ? (
                              <div style={{ textAlign: 'right', marginTop: 10 }}>
                                <Link to={`/search?author=${secondAuthor}&content=${data.socials.twitter.name}`}>
                                  View all results
                                </Link>
                              </div>
                            ) : null}
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <Typography.Text type="secondary">Nothing was found...</Typography.Text>
                    )}
                  </Col>
                  <Divider />
                  <Col span={24}>
                    <Typography.Title level={4}>Facebook:</Typography.Title>
                    {data.socials.facebook ? (
                      <div>
                        <div style={{ display: 'flex' }}>
                          <Typography.Text code>{data.socials.facebook.name}</Typography.Text>
                          <a
                            href={`https://facebook.com/${data.socials.facebook.name}`}
                            style={{ marginLeft: 15, fontSize: 14 }}
                          >
                            (Profile URL)
                          </a>
                        </div>
                        <Row gutter={24} style={{ marginTop: 15 }}>
                          <Col span={12}>
                            <Typography.Title level={5}>{firstAuthor}</Typography.Title>
                            <Collapse>
                              {data.socials.facebook.first.map(t => (
                                <Collapse.Panel
                                  header={
                                    <a
                                      href={`https://bitcointalk.org/index.php?topic=${t.topic_id}.msg${t.post_id}#msg${t.post_id}`}
                                    >
                                      {t.title.substring(0, 65)}
                                      {t.title.length > 50 ? '...' : ''}
                                    </a>
                                  }
                                  key={t.post_id}
                                >
                                  <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                    {parse(DOMPurity.sanitize(t.content))}
                                  </div>
                                </Collapse.Panel>
                              ))}
                            </Collapse>
                            {data.socials.facebook.first.length === 10 ? (
                              <div style={{ textAlign: 'right', marginTop: 10 }}>
                                <Link to={`/search?author=${firstAuthor}&content=${data.socials.facebook.name}`}>
                                  View all results
                                </Link>
                              </div>
                            ) : null}
                          </Col>
                          <Col span={12}>
                            <Typography.Title level={5}>{secondAuthor}</Typography.Title>
                            <Collapse>
                              {data.socials.facebook.second.map(t => (
                                <Collapse.Panel
                                  header={
                                    <a
                                      href={`https://bitcointalk.org/index.php?topic=${t.topic_id}.msg${t.post_id}#msg${t.post_id}`}
                                    >
                                      {t.title.substring(0, 65)}
                                      {t.title.length > 50 ? '...' : ''}
                                    </a>
                                  }
                                  key={t.post_id}
                                >
                                  <div style={{ maxHeight: 300, overflow: 'auto' }}>
                                    {parse(DOMPurity.sanitize(t.content))}
                                  </div>
                                </Collapse.Panel>
                              ))}
                            </Collapse>
                            {data.socials.facebook.second.length === 10 ? (
                              <div style={{ textAlign: 'right', marginTop: 10 }}>
                                <Link to={`/search?author=${secondAuthor}&content=${data.socials.facebook.name}`}>
                                  View all results
                                </Link>
                              </div>
                            ) : null}
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <Typography.Text type="secondary">Nothing was found...</Typography.Text>
                    )}
                  </Col>
                </Collapse.Panel>
              </Collapse>
            </Col>
            <Col span={24}>
              <Collapse defaultActiveKey="1">
                <Collapse.Panel header="All Socials" key="1">
                  <Row gutter={24}>
                    <Col span={12}>
                      <Typography.Title level={4}>{firstAuthor}</Typography.Title>
                      {data.all_socials &&
                        Object.keys(data.all_socials.first).map(social => (
                          <>
                            <Typography.Title level={5}>{social}</Typography.Title>
                            <Collapse style={{ marginBottom: 15 }}>
                              {data.all_socials &&
                                data.all_socials.first[social].map(occurrence => (
                                  <Collapse.Panel header={occurrence.name} key={occurrence.name}>
                                    content
                                  </Collapse.Panel>
                                ))}
                            </Collapse>
                          </>
                        ))}
                    </Col>
                    <Col span={12}>
                      <Typography.Title level={4}>{secondAuthor}</Typography.Title>
                      {data.all_socials &&
                        Object.keys(data.all_socials.second).map(social => (
                          <>
                            <Typography.Title level={5}>{social}</Typography.Title>
                            <Collapse style={{ marginBottom: 15 }}>
                              {data.all_socials &&
                                data.all_socials.second[social].map(occurrence => (
                                  <Collapse.Panel header={occurrence.name} key={occurrence.name}>
                                    content
                                  </Collapse.Panel>
                                ))}
                            </Collapse>
                          </>
                        ))}
                    </Col>
                  </Row>
                </Collapse.Panel>
              </Collapse>
            </Col>
          </Row>
        ) : null}
      </PageContent>
    </>
  );
};

export default Compare;
