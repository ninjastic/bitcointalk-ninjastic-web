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
                <AddressAuthorsCard address={address} />
              </div>
              <AddressPostCard postsId={data.posts_id} />
            </Card>
          </div>
        )}
      </PageContent>
    </>
  );
};

export default Address;
