import React from 'react';
import { useInfiniteQuery } from 'react-query';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  BackTop,
  Divider,
} from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { Observer } from 'mobx-react';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';

import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

import Header from '../../components/Header';
import AddressCard from '../../components/AddressCard';

import { PageContent } from './styles';

const { Text } = Typography;

interface Address {
  id: string;
  coin: string;
  address: string;
  posts_id: number[];
  created_at: Date;
  updated_at: Date;
}

const Addresses: React.FC = () => {
  const store = useSearchStore();

  const {
    setValue,
    searchQuery,
    isLoadingAddress,
    setIsLoadingAddress,
  } = store;

  const {
    isLoading,
    isFetching,
    refetch,
    fetchMore,
    canFetchMore,
    data,
    isError,
  } = useInfiniteQuery<Address[]>(
    `addresses`,
    async (key, last = '') => {
      const { address, address_author } = searchQuery;

      let results;

      if (!address_author) {
        const { data: responseData } = await api.get('addresses', {
          params: {
            address,
            last,
            limit: 50,
          },
        });

        results = responseData;
      } else if (address_author && !address) {
        const { data: responseData } = await api.get(
          `users/${address_author}/addresses`,
          {
            params: {
              last,
              limit: 50,
            },
          },
        );

        results = responseData;
      }

      setIsLoadingAddress(false);

      return results.data;
    },
    {
      enabled: false,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (lastGroup.length < 50) return false;

        const last = lastGroup[lastGroup.length - 1];
        return `${last.address},${last.created_at},${last.id}`;
      },
    },
  );

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      setIsLoadingAddress(true);
      refetch();
    }
  };

  useBottomScrollListener(() => {
    if (!canFetchMore || isFetching) return;

    fetchMore();
  }, 500);

  const LoadingMoreCard = ({ groupIndex }) => {
    if (groupIndex === data.length - 1) {
      return canFetchMore ? (
        <Card loading style={{ marginTop: 15 }} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text>You reached the end!</Text>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Header />
      <PageContent>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={24} lg={8}>
            <Card title="Search params" type="inner">
              <Form layout="vertical" size="large">
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item label="Address">
                      <Observer>
                        {() => (
                          <Input
                            allowClear
                            placeholder="1NinjabXd5znM5zgTcmxDVzH4w3nbaY16L"
                            onKeyDown={handleKeyDown}
                            defaultValue={searchQuery.address}
                            disabled={!!searchQuery.address_author.length}
                            onChange={e =>
                              setValue('address', e.target.value.trim())
                            }
                          />
                        )}
                      </Observer>
                    </Form.Item>
                  </Col>

                  <Divider>Or</Divider>
                  <Col span={24}>
                    <Form.Item label="Username">
                      <Observer>
                        {() => (
                          <Input
                            allowClear
                            placeholder="TryNinja"
                            onKeyDown={handleKeyDown}
                            defaultValue={searchQuery.address_author}
                            disabled={!!searchQuery.address.length}
                            onChange={e =>
                              setValue('address_author', e.target.value.trim())
                            }
                          />
                        )}
                      </Observer>
                    </Form.Item>
                  </Col>

                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={
                          isFetching ||
                          isLoading ||
                          (isLoadingAddress && !isError) ? (
                            <LoadingOutlined style={{ color: '#fff' }} />
                          ) : (
                            <SearchOutlined />
                          )
                        }
                        disabled={
                          isFetching ||
                          isLoading ||
                          (isLoadingAddress && !isError)
                        }
                        onClick={() => {
                          setIsLoadingAddress(true);
                          refetch();
                        }}
                      >
                        Search
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
          <Col xs={24} md={24} lg={16}>
            <Observer>
              {() => {
                return (!data || isLoading || isLoadingAddress) && !isError ? (
                  <Card
                    title="What do you want to find today?"
                    loading={isLoading || isFetching || isLoadingAddress}
                    type="inner"
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Text>Do your search on the card on the side</Text>
                      <Text>or</Text>
                      <Text style={{ textAlign: 'center' }}>
                        Just click the button and get a few random addresses.
                      </Text>
                    </div>
                  </Card>
                ) : null;
              }}
            </Observer>

            {data && !isLoading && !isLoadingAddress ? (
              <div>
                {!data.length ? (
                  <Text strong key={1}>
                    No results...
                  </Text>
                ) : null}
                {data.map((group, groupIndex) => {
                  if (!group.length) {
                    return (
                      <Text strong key={1}>
                        No results...
                      </Text>
                    );
                  }
                  return group.map((record, i, array) => {
                    return (
                      <div style={{ marginBottom: 15 }} key={record.address}>
                        <AddressCard
                          data={record}
                          number={groupIndex * 50 + i + 1}
                        />
                        {i === array.length - 1 ? (
                          <LoadingMoreCard groupIndex={groupIndex} />
                        ) : null}
                      </div>
                    );
                  });
                })}
              </div>
            ) : null}
          </Col>
        </Row>
        <BackTop />
      </PageContent>
    </div>
  );
};

export default Addresses;
