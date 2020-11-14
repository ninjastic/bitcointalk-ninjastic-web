import React, { useState } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
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
  Select,
  Radio,
  Tabs,
  Checkbox,
} from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { Observer } from 'mobx-react';
import { autorun } from 'mobx';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { useHistory, useLocation } from 'react-router-dom';
import numeral from 'numeral';
import queryString from 'query-string';

import api from '../../services/api';
import { useSearchStore } from '../../stores/SearchStore';

import Header from '../../components/Header';
import AddressCard from '../../components/AddressCard';
import BoardSelect from '../../components/BoardSelect';
import CompactAddressCard from '../../components/CompactAddressCard';

import { PageContent } from './styles';

const { Text, Title } = Typography;
const { Option } = Select;

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

const AuthorsTab: React.FC = () => {
  const store = useSearchStore();
  const { searchQuery } = store;

  const [showCount, setShowCount] = useState(false);
  const [showBBCode, setShowBBCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data, isError } = useQuery(
    'addresses:Authors',
    async () => {
      const { address, address_author, address_coin, address_board, address_child_boards } = searchQuery;

      setIsLoading(true);

      const { data: responseData } = await api.get('addresses/authors', {
        params: {
          address,
          author: address_author,
          coin: address_coin,
          board: address_board,
          child_boards: address_child_boards,
        },
      });

      setIsLoading(false);

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
        <LoadingOutlined style={{ fontSize: 24 }} />
      </div>
    );
  }

  if (isError) {
    return <Text>Something wrong happened...</Text>;
  }

  const authorsText = data?.data.authors?.reduce((prev, curr, i, array) => {
    if (showBBCode) {
      const forumProfileURL = '/index.php?action=profile;u=';

      let text = '';
      text += `${prev}`;
      text += `[url=${forumProfileURL}${curr.author_uid}]${curr.author}[/url]`;
      text += showCount ? ` (${curr.count})` : '';
      text += i !== array.length - 1 ? '\n' : '';

      return text;
    }

    return `${prev}${curr.author}${showCount ? ` (${curr.count})` : ''}${i !== array.length - 1 ? '\n' : ''}`;
  }, '');

  return (
    <div>
      <Title level={3}>List of users ({data?.data.authors?.length || '0'})</Title>
      <Checkbox onChange={e => setShowCount(e.target.checked)} style={{ marginBottom: 10 }}>
        Include count
      </Checkbox>
      <Checkbox onChange={e => setShowBBCode(e.target.checked)} style={{ marginBottom: 10 }}>
        BBCode
      </Checkbox>
      <Input.TextArea value={authorsText} contentEditable={false} autoSize={{ minRows: 3, maxRows: 10 }} />
    </div>
  );
};

const Addresses: React.FC = () => {
  const store = useSearchStore();
  const history = useHistory();
  const { search } = useLocation();

  const [viewType, setViewType] = useState('normal');

  const { setValue, searchQuery, isLoadingAddress, setIsLoadingAddress } = store;

  autorun(() => {
    const query = queryString.parse(search);

    setValue('address', query.address);
    setValue('address_author', query.author);
    setValue('address_coin', query.coin);
    setValue('address_board', query.board);
    setValue('address_child_boards', query.child_boards);
  });

  const { isLoading, isFetching, refetch, fetchMore, canFetchMore, data, isError } = useInfiniteQuery<Response>(
    `addresses`,
    async (key, last = null) => {
      const { address, address_author, address_coin, address_board, address_child_boards } = searchQuery;

      const { data: responseData } = await api.get('addresses', {
        params: {
          address,
          author: address_author,
          coin: address_coin,
          board: address_board,
          child_boards: address_child_boards,
          last,
          limit: 50,
        },
      });

      setIsLoadingAddress(false);

      return responseData;
    },
    {
      enabled: false,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.addresses.length < 50) return false;

        const last = lastGroup.data.addresses[lastGroup.data.addresses.length - 1];
        return last.post_id;
      },
    },
  );

  const searchAddresses = () => {
    const queryStringified = queryString.stringify(
      {
        address: searchQuery.address,
        author: searchQuery.address_author,
        coin: searchQuery.address_coin,
        board: searchQuery.address_board,
        child_boards: searchQuery.address_child_boards,
      },
      { skipEmptyString: true, skipNull: true },
    );

    history.push(`/addresses?${queryStringified}`);

    setIsLoadingAddress(true);
    refetch();
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      searchAddresses();
    }
  };

  useBottomScrollListener(() => {
    if (!canFetchMore || isFetching) return;

    fetchMore();
  }, 500);

  const LoadingMore = ({ groupIndex, onlyIcon = false }) => {
    if (groupIndex === data.length - 1) {
      if (!canFetchMore) {
        return (
          <div style={{ textAlign: 'center', marginTop: 25 }}>
            <Text type="secondary">You reached the end!</Text>
          </div>
        );
      }

      return onlyIcon ? (
        <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
          <LoadingOutlined style={{ fontSize: 30 }} />
        </div>
      ) : (
        <Collapse style={{ marginTop: 15 }}>
          <Collapse.Panel
            key="Loading"
            disabled
            header={
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <LoadingOutlined style={{ fontSize: 24 }} />
              </div>
            }
          />
        </Collapse>
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
                            onChange={e => setValue('address', e.target.value.trim())}
                          />
                        )}
                      </Observer>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Username">
                      <Input
                        allowClear
                        placeholder="TryNinja"
                        onKeyDown={handleKeyDown}
                        defaultValue={searchQuery.address_author}
                        onChange={e => setValue('address_author', e.target.value.trim())}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Coin">
                      <Select
                        defaultValue={searchQuery.address_coin || 'Any'}
                        onChange={value => setValue('address_coin', value)}
                      >
                        <Option value="">Any</Option>
                        <Option value="BTC">BTC</Option>
                        <Option value="ETH">ETH</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Board">
                      <BoardSelect searchQueryField="address_board" />
                      <Checkbox
                        style={{ marginTop: 15 }}
                        defaultChecked={searchQuery.address_child_boards}
                        onChange={e => setValue('address_child_boards', e.target.checked)}
                      >
                        Include child boards
                      </Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    <Form.Item>
                      <Button
                        type="primary"
                        icon={
                          isFetching || isLoading || (isLoadingAddress && !isError) ? (
                            <LoadingOutlined style={{}} />
                          ) : (
                            <SearchOutlined />
                          )
                        }
                        disabled={isFetching || isLoading || (isLoadingAddress && !isError)}
                        onClick={searchAddresses}
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
                      <Text style={{ textAlign: 'center' }}>Just click the button and get the latest addresses.</Text>
                    </div>
                  </Card>
                ) : null;
              }}
            </Observer>
            {!isLoading && isError ? (
              <Card>
                <Text strong>Something went wrong...</Text>
              </Card>
            ) : null}
            {data && !isLoading && !isLoadingAddress ? (
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Results" key="1">
                  <div style={{ marginBottom: 15 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {data && !isLoading ? (
                        <Text>
                          <Text style={{ fontWeight: 500 }}>Total results:</Text>{' '}
                          {numeral(data[0].data.total_results || 0).format('0,0')}
                        </Text>
                      ) : null}
                      <Radio.Group onChange={e => setViewType(e.target.value)} value={viewType} defaultValue="normal">
                        <Radio.Button value="normal">Normal</Radio.Button>
                        <Radio.Button value="compact">Compact</Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>
                  {data.map((group, groupIndex) => {
                    if (!group.data.addresses.length) {
                      return (
                        <Card>
                          <Text strong key={1}>
                            No results...
                          </Text>
                        </Card>
                      );
                    }
                    return group.data.addresses.map((record, i, array) => {
                      switch (viewType) {
                        case 'normal':
                          return (
                            <div style={{ marginBottom: 15 }} key={`${record.address}_${record.post_id}`}>
                              <AddressCard data={record} number={groupIndex * 50 + i + 1} />
                              {i === array.length - 1 ? <LoadingMore groupIndex={groupIndex} /> : null}
                            </div>
                          );
                        case 'compact':
                          return (
                            <ul
                              key={`${record.address}_${record.post_id}`}
                              style={{
                                paddingInlineStart: 20,
                                marginBottom: 0,
                              }}
                            >
                              <CompactAddressCard data={record} number={groupIndex * 100 + i + 1} />
                              {i === array.length - 1 ? <LoadingMore groupIndex={groupIndex} onlyIcon /> : null}
                            </ul>
                          );
                        default:
                          return null;
                      }
                    });
                  })}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Users" key="2">
                  <AuthorsTab />
                </Tabs.TabPane>
              </Tabs>
            ) : null}
          </Col>
        </Row>
        <BackTop />
      </PageContent>
    </div>
  );
};

export default Addresses;
