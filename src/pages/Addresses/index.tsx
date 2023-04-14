import React, { useEffect, useState } from 'react';
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

const { Text } = Typography;
const { Option } = Select;

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

const AuthorsTab: React.FC = () => {
  const store = useSearchStore();
  const { searchQuery } = store;

  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultFormat, setResultFormat] = useState('{number}. {username} [{count}]');
  const [limit, setLimit] = useState('1000');

  const { data, refetch, isError } = useQuery(
    'addresses:Authors',
    async () => {
      const { address, author, coin, board, child_boards } = searchQuery.addresses;

      setGenerated(true);
      setIsLoading(true);

      const { data: responseData } = await api.get('addresses/authors', {
        params: {
          address,
          author,
          coin,
          board,
          child_boards,
          limit,
        },
      });

      setIsLoading(false);

      return responseData;
    },
    { enabled: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const resultText =
    !isLoading &&
    !isError &&
    data?.data.authors?.reduce((prev, curr, i, array) => {
      const resultFormatted = resultFormat
        .replace(/{username}/g, curr.author)
        .replace(/{count}/g, curr.count)
        .replace(/{uid}/g, curr.author_uid)
        .replace(/{number}/g, i + 1);
      let text = `${prev}${resultFormatted}`;

      if (i !== array.length - 1) {
        text += '\n';
      }

      return text;
    }, '');

  return (
    <div>
      <Card title="Generate list of users from the result">
        <Col span={24} style={{ textAlign: 'right' }}>
          <Form.Item label="Format">
            <Input
              placeholder="{number}. {username} [{count}]"
              value={resultFormat}
              onChange={e => setResultFormat(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Limit">
            <Input placeholder="1000" value={limit} onChange={e => setLimit(e.target.value)} type="number" min={1} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Text style={{ fontWeight: 400 }}>Variables available: </Text>
              <Text type="secondary">{'{number} {username} {uid} {count}'}</Text>
            </div>
            <Button onClick={() => refetch()} disabled={!resultFormat}>
              Generate
            </Button>
          </div>
        </Col>
      </Card>
      {generated ? (
        <Card title={`Results (${data?.data?.total_results || 0})`} style={{ marginTop: 15 }}>
          {isLoading && !isError ? (
            <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
              <LoadingOutlined style={{ fontSize: 24 }} />
            </div>
          ) : null}
          {!isLoading && !isError ? (
            <Input.TextArea value={resultText} contentEditable={false} autoSize={{ minRows: 3, maxRows: 10 }} />
          ) : null}
          {isError ? <Text type="secondary">Something went wrong</Text> : null}
        </Card>
      ) : null}
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

    setValue('addresses', 'address', query.address);
    setValue('addresses', 'author', query.author);
    setValue('addresses', 'coin', query.coin);
    setValue('addresses', 'board', query.board);
    setValue('addresses', 'child_boards', query.child_boards);
  });

  const { isLoading, isFetching, refetch, fetchMore, canFetchMore, data, isError } = useInfiniteQuery<Response>(
    `addresses`,
    async (key, last = null) => {
      const { address, author, coin, board, child_boards } = searchQuery.addresses;

      const { data: responseData } = await api.get('addresses', {
        params: {
          address,
          author,
          coin,
          board,
          child_boards,
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
        address: searchQuery.addresses.address,
        author: searchQuery.addresses.author,
        coin: searchQuery.addresses.coin,
        board: searchQuery.addresses.board,
        child_boards: searchQuery.addresses.child_boards,
      },
      { skipEmptyString: true, skipNull: true },
    );

    history.push(`/addresses?${queryStringified}`);

    setIsLoadingAddress(true);
    refetch();
  };

  useEffect(() => {
    if (Object.keys(searchQuery.addresses).filter(key => searchQuery.addresses[key]).length) {
      searchAddresses();
    }
  }, []);

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
                            defaultValue={searchQuery.addresses.address}
                            onChange={e => setValue('addresses', 'address', e.target.value.trim())}
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
                        defaultValue={searchQuery.addresses.author}
                        onChange={e => setValue('addresses', 'author', e.target.value.trim())}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Coin">
                      <Select
                        defaultValue={searchQuery.addresses.coin || 'Any'}
                        onChange={value => setValue('addresses', 'coin', value)}
                      >
                        <Option value="">Any</Option>
                        <Option value="BTC">BTC</Option>
                        <Option value="ETH">ETH</Option>
                        <Option value="TRX">TRX</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Board">
                      <BoardSelect searchQueryField="board" type="addresses" />
                      <Checkbox
                        style={{ marginTop: 15 }}
                        defaultChecked={searchQuery.addresses.child_boards}
                        onChange={e => setValue('addresses', 'child_boards', e.target.checked)}
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
              {() =>
                (!data || isLoading || isLoadingAddress) && !isError ? (
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
                ) : null
              }
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
