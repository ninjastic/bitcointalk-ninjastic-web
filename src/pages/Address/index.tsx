import React from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { Typography, Card, Button } from 'antd';
import { LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import Header from '../../components/Header';
import AddressAuthorsCard from '../../components/AddressAuthorsCard';
import AddressPostCard from '../../components/AddressPostCard';

import api from '../../services/api';

import { PageContent } from './styles';

const { Text, Title } = Typography;

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

interface Response {
  data: Address;
}

const Address: React.FC = () => {
  const history = useHistory();
  const { address } = useRouteMatch().params as MatchParams;

  const { data, isLoading, isError } = useQuery<Response>(
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
          <Title style={{ marginBottom: -5 }}>Address</Title>
        </div>
        {isLoading ? (
          <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
        ) : null}
        {isError ? <Text>Something went wrong</Text> : null}
        {data ? (
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
                        {data.data.address}
                      </span>
                    </div>
                  </div>
                </div>
              }
              type="inner"
            >
              <div style={{ marginBottom: 10 }}>
                <AddressAuthorsCard address={address} />
              </div>
              <AddressPostCard postsId={data.data.posts_id} />
            </Card>
          </div>
        ) : null}
      </PageContent>
    </>
  );
};

export default Address;
