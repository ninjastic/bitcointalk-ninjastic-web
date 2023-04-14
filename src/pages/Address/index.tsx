import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Typography, Card, Button, Row, Col, Tabs } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import api from '../../services/api';

import Header from '../../components/Header';
import AddressCard from '../../components/AddressCard';
import AddressDetailsETH from '../../components/AddressDetailsETH';
import AddressDetailsBTC from '../../components/AddressDetailsBTC';
import AddressDetailsTRX from '../../components/AddressDetailsTRX';
import AddressTransactionsETH from '../../components/AddressTransactionsETH';
import AddressAuthorsCard from '../../components/AddressAuthorsCard';

import { PageContent } from './styles';

const { Text, Title } = Typography;

interface MatchParams {
  address: string;
}

interface Address {
  address: string;
  coin: 'BTC' | 'ETH' | 'TRX';
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

const AddressPage: React.FC = () => {
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
            <Text type="secondary">Something went wrong</Text>
          </Card>
        ) : null}
        {!isLoading && !isError && !data?.data.total_results ? (
          <Card style={{ display: 'flex', justifyContent: 'center' }}>
            <Text>This address was not found on our database.</Text>
          </Card>
        ) : null}
        {!isLoading && data?.data.total_results ? (
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            <Row gutter={[24, 24]}>
              <Col xs={24} md={7} lg={7}>
                {data.data.addresses[0].coin === 'ETH' && (
                  <AddressDetailsETH address={data.data.addresses[0].address} />
                )}
                {data.data.addresses[0].coin === 'BTC' && (
                  <AddressDetailsBTC address={data.data.addresses[0].address} />
                )}
                {data.data.addresses[0].coin === 'TRX' && (
                  <AddressDetailsTRX address={data.data.addresses[0].address} />
                )}
              </Col>
              <Col xs={24} md={17} lg={17}>
                <Tabs defaultActiveKey="1">
                  <Tabs.TabPane key="1" tab="Mentions">
                    {data.data.addresses.map((entry, index) => (
                      <div style={{ marginBottom: 10 }}>
                        <AddressCard key={entry.address} data={entry} number={index} showAddress={false} />
                      </div>
                    ))}
                  </Tabs.TabPane>
                  <Tabs.TabPane key="2" tab="Authors">
                    <AddressAuthorsCard address={data.data.addresses[0].address} />
                  </Tabs.TabPane>
                  {data.data.addresses[0].coin === 'ETH' ? (
                    <Tabs.TabPane key="3" tab="Token Transactions">
                      <AddressTransactionsETH address={data.data.addresses[0].address} />
                    </Tabs.TabPane>
                  ) : null}
                </Tabs>
              </Col>
            </Row>
          </Card>
        ) : null}
      </PageContent>
    </>
  );
};

export default AddressPage;
