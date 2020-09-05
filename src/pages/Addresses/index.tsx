import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  BackTop,
  Collapse,
} from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { Observer } from 'mobx-react';

import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

import Header from '../../components/Header';
import AddressAuthorsCard from '../../components/AddressAuthorsCard';
import AddressPostCard from '../../components/AddressPostCard';

import { PageContent } from './styles';

interface Address {
  coin: string;
  address: string;
  posts_id: number[];
  created_at: Date;
  updated_at: Date;
}

interface PostMatchParams {
  postsId: number[];
}

const Addresses: React.FC = () => {
  const store = useSearchStore();

  const {
    setValue,
    searchQuery,
    isLoadingAddress,
    setIsLoadingAddress,
  } = store;

  const { isLoading, isFetching, refetch, data } = useQuery<Address[]>(
    'addresses',
    async () => {
      const { address } = searchQuery;

      const { data: responseData } = await api.get(
        `addresses?address=${address}&limit=50`,
      );

      setIsLoadingAddress(false);

      return responseData;
    },
    {
      enabled: false,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      setIsLoadingAddress(true);
      refetch();
    }
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
                      <Input
                        placeholder="1NinjabXd5znM5zgTcmxDVzH4w3nbaY16L"
                        onKeyDown={handleKeyDown}
                        defaultValue={searchQuery.address}
                        onChange={e =>
                          setValue('address', e.target.value.trim())
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={
                          isFetching || isLoading || isLoadingAddress ? (
                            <LoadingOutlined />
                          ) : (
                            <SearchOutlined />
                          )
                        }
                        disabled={isFetching || isLoading || isLoadingAddress}
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
                return !data || isLoading || isLoadingAddress ? (
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
                      <Typography.Text>
                        Do your search on the card on the side
                      </Typography.Text>
                      <Typography.Text>or</Typography.Text>
                      <Typography.Text style={{ textAlign: 'center' }}>
                        Just click the button and get a few random addresses.
                      </Typography.Text>
                    </div>
                  </Card>
                ) : null;
              }}
            </Observer>

            {data && !isLoading && !isLoadingAddress ? (
              <div>
                {!data.length ? (
                  <Typography.Text strong key={1}>
                    No results...
                  </Typography.Text>
                ) : null}
                {data.map((address, index) => {
                  return (
                    <div style={{ marginBottom: 15 }} key={address.address}>
                      <Collapse>
                        <Collapse.Panel
                          key={address.address}
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

                              <div>
                                (#
                                {index + 1})
                              </div>
                            </div>
                          }
                        >
                          <div style={{ marginBottom: 10 }}>
                            <AddressAuthorsCard address={address.address} />
                          </div>
                          <AddressPostCard postsId={address.posts_id} />
                        </Collapse.Panel>
                      </Collapse>
                    </div>
                  );
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
