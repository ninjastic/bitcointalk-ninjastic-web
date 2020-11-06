import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch, Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  Table,
  Image,
  Button,
  Radio,
  Tabs,
} from 'antd';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { sub, addMinutes, startOfDay, endOfDay } from 'date-fns';
import { useMediaQuery } from 'react-responsive';
import queryString from 'query-string';

import { LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';
import HeaderPostCard from '../../components/HeaderPostCard';
import CompactPostCard from '../../components/CompactPostCard';
import PostsLineChart from '../../components/PostsLineChart';
import PostsBarChart from '../../components/PostsBarChart';

import { PageContent } from './styles';
import AddressAggregatorCard from '../../components/AddressAggregatorCard/indes';

const { Text, Title } = Typography;

interface BoardsData {
  name: string;
  count: number;
}

interface MatchParams {
  username?: string;
  author_uid?: number;
}

interface BoardsChartProps {
  data: BoardsData[];
  total: number;
  loading?: boolean;
}

const UserAvatar: React.FC<{ author_uid: number }> = ({ author_uid }) => {
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  const onLoad = () => {
    setAvatarSuccess(true);
  };

  return (
    <Image
      src={`https://bitcointalk.org/useravatars/avatar_${author_uid}.png`}
      alt="User avatar"
      onLoad={onLoad}
      style={{
        marginRight: 15,
        display: avatarSuccess ? 'initial' : 'none',
      }}
      fallback={`https://bitcointalk.org/useravatars/avatar_${author_uid}.jpg`}
    />
  );
};

const DeletedPosts: React.FC<{ username: string }> = ({ username }) => {
  const [postsViewType, setPostsViewType] = useState('normal');

  const {
    data,
    isLoading,
    fetchMore,
    isFetchingMore,
    canFetchMore,
    isError,
  } = useInfiniteQuery(
    `userDeletedPosts:${username}`,
    async (key, last = null) => {
      const { data: responseData } = await api.get('posts/history', {
        params: {
          deleted: true,
          author: username,
          last,
        },
      });

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.posts_history.length < 20) return false;

        return lastGroup.data.posts_history[
          lastGroup.data.posts_history.length - 1
        ].created_at;
      },
    },
  );

  if (isLoading) {
    return (
      <Card title="Deleted Posts">
        <LoadingOutlined />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card title="Deleted Posts">
        <Text type="secondary">Something went wrong...</Text>
      </Card>
    );
  }

  if (!data[0].data.total_results) {
    return (
      <Card title={`Deleted Posts (${data[0].data.total_results})`}>
        <Text type="secondary">No results...</Text>
      </Card>
    );
  }

  return (
    <Card title={`Deleted Posts (${data[0].data.total_results})`}>
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
              <Text style={{ fontWeight: 500 }}>Results: </Text>
              <Text>{data[0].data.total_results}</Text>
            </Text>
          ) : null}
          <Radio.Group
            onChange={e => setPostsViewType(e.target.value)}
            value={postsViewType}
            defaultValue="normal"
          >
            <Radio.Button value="normal">Normal</Radio.Button>
            <Radio.Button value="header">Header Only</Radio.Button>
            <Radio.Button value="compact">Compact</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      {data.map((group, groupIndex, array) => {
        if (!group.data.posts_history.length) {
          return (
            <div style={{ textAlign: 'center' }} key="NoResults">
              <Text type="secondary">No results.</Text>
            </div>
          );
        }

        return (
          <div key={groupIndex}>
            {group.data.posts_history.map((post, i) => {
              switch (postsViewType) {
                case 'normal':
                  return (
                    <div style={{ marginBottom: 30 }} key={post.post_id}>
                      <PostCard data={post} number={groupIndex * 100 + i + 1} />
                      <Divider />
                    </div>
                  );
                case 'header':
                  return (
                    <div key={post.post_id}>
                      <HeaderPostCard
                        data={post}
                        number={groupIndex * 100 + i + 1}
                        style={{ marginBottom: 15 }}
                      />
                    </div>
                  );
                case 'compact':
                  return (
                    <ul
                      key={post.post_id}
                      style={{ paddingInlineStart: 20, marginBottom: 0 }}
                    >
                      <CompactPostCard
                        data={post}
                        number={groupIndex * 100 + i + 1}
                      />
                    </ul>
                  );
                default:
                  return null;
              }
            })}
            {groupIndex === array.length - 1 ? (
              <div style={{ marginTop: 15, textAlign: 'center' }}>
                {canFetchMore ? (
                  <Button
                    size="large"
                    onClick={() => fetchMore()}
                    disabled={!!isFetchingMore}
                    style={{ width: 110 }}
                  >
                    {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
                  </Button>
                ) : (
                  <Text type="secondary">You reached the end!</Text>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </Card>
  );
};

const EditedPosts: React.FC<{ username: string }> = ({ username }) => {
  const [postsViewType, setPostsViewType] = useState('normal');

  const {
    data,
    isLoading,
    fetchMore,
    isFetchingMore,
    canFetchMore,
    isError,
  } = useInfiniteQuery(
    `userEditedPosts:${username}`,
    async (key, last = null) => {
      const { data: responseData } = await api.get(`posts/history`, {
        params: {
          deleted: false,
          author: username,
          last,
        },
      });

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.posts_history.length < 20) return false;

        return lastGroup.data.posts_history[
          lastGroup.data.posts_history.length - 1
        ].created_at;
      },
    },
  );

  if (isLoading) {
    return (
      <Card title="Edited Posts">
        <LoadingOutlined />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card title="Edited Posts">
        <Text type="secondary">Something went wrong...</Text>
      </Card>
    );
  }

  if (!data[0].data.total_results) {
    return (
      <Card title="Edited Posts">
        <Text type="secondary">No results...</Text>
      </Card>
    );
  }

  return (
    <Card title={`Edited Posts (${data[0].data.total_results})`}>
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
              <Text strong>Results: </Text>
              <Text>{data[0].data.total_results}</Text>
            </Text>
          ) : null}
          <Radio.Group
            onChange={e => setPostsViewType(e.target.value)}
            value={postsViewType}
            defaultValue="normal"
          >
            <Radio.Button value="normal">Normal</Radio.Button>
            <Radio.Button value="header">Header Only</Radio.Button>
            <Radio.Button value="compact">Compact</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      {data.map((group, groupIndex, array) => {
        if (!group.data.posts_history.length) {
          return (
            <div style={{ textAlign: 'center' }} key="NoResults">
              <Text type="secondary">No results.</Text>
            </div>
          );
        }

        return (
          <div key={groupIndex}>
            {group.data.posts_history.map((post, i) => {
              switch (postsViewType) {
                case 'normal':
                  return (
                    <div style={{ marginBottom: 30 }} key={post.post_id}>
                      <PostCard data={post} number={groupIndex * 100 + i + 1} />
                      <Divider />
                    </div>
                  );
                case 'header':
                  return (
                    <div key={post.post_id}>
                      <HeaderPostCard
                        data={post}
                        number={groupIndex * 100 + i + 1}
                        style={{ marginBottom: 15 }}
                      />
                    </div>
                  );
                case 'compact':
                  return (
                    <ul
                      key={post.post_id}
                      style={{ paddingInlineStart: 20, marginBottom: 0 }}
                    >
                      <CompactPostCard
                        data={post}
                        number={groupIndex * 100 + i + 1}
                      />
                    </ul>
                  );
                default:
                  return null;
              }
            })}
            {groupIndex === array.length - 1 ? (
              <div style={{ marginTop: 15, textAlign: 'center' }}>
                {canFetchMore ? (
                  <Button
                    size="large"
                    onClick={() => fetchMore()}
                    disabled={!!isFetchingMore}
                    style={{ width: 110 }}
                  >
                    {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
                  </Button>
                ) : (
                  <Text type="secondary">You reached the end!</Text>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </Card>
  );
};

const FavoriteTopics: React.FC<{ username: string }> = ({ username }) => {
  const [period, setPeriod] = useState('all-time');

  const getDatePeriod = datePeriod => {
    let from = null;
    let to = null;

    const dateUTC = addMinutes(new Date(), new Date().getTimezoneOffset());

    switch (datePeriod) {
      case 'all-time':
        from = null;
        to = null;
        break;
      case '30-days':
        from = sub(startOfDay(dateUTC), { months: 1 }).toISOString();
        to = endOfDay(dateUTC).toISOString();
        break;
      case '7-days':
        from = sub(startOfDay(dateUTC), { weeks: 1 }).toISOString();
        to = endOfDay(dateUTC).toISOString();
        break;
      default:
        break;
    }

    return [from, to];
  };

  const { data, isLoading, refetch, isFetching } = useQuery(
    `userTopTopics:${username}`,
    async () => {
      const [from, to] = getDatePeriod(period);

      const { data: responseData } = await api.get(
        `/users/${username}/topics`,
        { params: { from, to } },
      );

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  useEffect(() => {
    refetch();
  }, [period, refetch]);

  const [from, to] = getDatePeriod(period);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a href={`https://bitcointalk.org/index.php?topic=${record.topic_id}`}>
          {text}
        </a>
      ),
    },
    {
      title: 'Posts',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'View Posts',
      dataIndex: 'topic_id',
      key: 'view-posts',
      width: 130,
      render: (_, record) => {
        const queryStringified = queryString.stringify(
          {
            author: username,
            topic_id: record.topic_id,
            after_date: from,
            before_date: to,
          },
          { skipEmptyString: true, skipNull: true },
        );

        return <Link to={`/search?${queryStringified}`}>View</Link>;
      },
    },
    {
      title: 'View Topic Stats',
      dataIndex: 'topic_id',
      key: 'view-posts',
      width: 130,
      render: (_, record) => {
        return <Link to={`/topic/${record.topic_id}`}>View</Link>;
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Radio.Group
          defaultValue="all-time"
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <Radio.Button value="all-time">All time</Radio.Button>
          <Radio.Button value="30-days">30 days</Radio.Button>
          <Radio.Button value="7-days">7 days</Radio.Button>
        </Radio.Group>
      </div>
      <Table
        size="small"
        dataSource={data?.data}
        columns={columns}
        bordered
        rowKey="topic_id"
        loading={isLoading || isFetching}
        pagination={false}
      />
    </div>
  );
};

const MentionedAddresses: React.FC<{ username: string }> = ({ username }) => {
  interface Address {
    address: string;
    coin: 'BTC' | 'ETH';
    count: number;
  }

  interface Data {
    after_key: string;
    addresses: Address[];
  }

  interface Response {
    data: Data;
  }

  const {
    data,
    isLoading,
    fetchMore,
    isFetchingMore,
    canFetchMore,
    isError,
  } = useInfiniteQuery<Response>(
    `userAddresses:${username}`,
    async (key, last = null) => {
      const { data: responseData } = await api.get(`/addresses/unique`, {
        params: {
          author: username,
          last,
          limit: 20,
        },
      });

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getFetchMore: lastGroup => {
        if (!lastGroup.data.after_key) return false;

        return lastGroup.data.after_key;
      },
    },
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (isError) {
    return <Text type="secondary">Something went wrong...</Text>;
  }

  if (!data?.length) {
    return <Text type="secondary">No results...</Text>;
  }

  return (
    <div>
      {data.map((group, groupIndex, array) => {
        return (
          <div key={groupIndex}>
            {group.data.addresses.map(address => {
              return (
                <AddressAggregatorCard
                  key={address.address}
                  address={address.address}
                  coin={address.coin}
                  count={address.count}
                  author={username}
                />
              );
            })}
            {groupIndex === array.length - 1 ? (
              <div style={{ marginTop: 15, textAlign: 'center' }}>
                {canFetchMore ? (
                  <Button
                    size="large"
                    onClick={() => fetchMore()}
                    disabled={!!isFetchingMore}
                    style={{ width: 110 }}
                  >
                    {isFetchingMore ? <LoadingOutlined /> : 'Load more'}
                  </Button>
                ) : (
                  <Text type="secondary">You reached the end!</Text>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const FavoriteAddresses: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = useQuery(
    `favoriteAddresses:${username}`,
    async () => {
      const { data: responseData } = await api.get(`/addresses/unique/top`, {
        params: {
          author: username,
          limit: 5,
        },
      });

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (isError) {
    return <Text type="secondary">Something went wrong...</Text>;
  }

  if (!data?.data?.addresses?.length) {
    return <Text type="secondary">No results...</Text>;
  }

  return (
    <div>
      {data.data.addresses.map(address => {
        return (
          <AddressAggregatorCard
            address={address.address}
            coin={address.coin}
            key={address.address}
            count={address.count}
            author={username}
          />
        );
      })}
    </div>
  );
};

const PostsWeekChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading } = useQuery(
    `user:${username}:posts:week`,
    async () => {
      const { data: responseData } = await api.get(`/users/${username}/posts`);

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <PostsLineChart
      data={data?.data}
      loading={isLoading}
      dateFormat="MM/dd"
      size="small"
    />
  );
};

const PostsMonthChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading } = useQuery(
    `userPostsMonth:${username}`,
    async () => {
      const oneMonthAgo = sub(new Date(), { months: 1 }).toISOString();

      const { data: responseData } = await api.get(`/users/${username}/posts`, {
        params: {
          from: oneMonthAgo,
        },
      });

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <PostsLineChart
      data={data?.data}
      loading={isLoading}
      dateFormat="MM/dd"
      size="small"
    />
  );
};

const PostsYearChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading } = useQuery(
    `userPostsYear:${username}`,
    async () => {
      const oneYearAgo = sub(new Date(), { years: 1 }).toISOString();

      const { data: responseData } = await api.get(`/users/${username}/posts`, {
        params: {
          from: oneYearAgo,
          interval: '7d',
        },
      });

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <PostsBarChart data={data?.data} loading={isLoading} dateFormat="MM/dd" />
  );
};

const BoardsChart: React.FC<BoardsChartProps> = ({ data, total, loading }) => {
  const COLORS = [
    { start: '#ED213A', end: '#93291E' },
    { start: '#525252', end: '#3d72b4' },
    { start: '#00B4DB', end: '#0083B0' },
    { start: '#ffb347', end: '#ffcc33' },
    { start: '#CB356B', end: '#BD3F32' },
    { start: '#fd746c', end: '#ff9068' },
    { start: '#f46b45', end: '#eea849' },
    { start: '#11998e', end: '#38ef7d' },
    { start: '#396afc', end: '#2948ff' },
    { start: '#7F00FF', end: '#E100FF' },
  ];

  if (loading) {
    return (
      <div style={{ height: 100, textAlign: 'center', marginTop: 50 }}>
        <LoadingOutlined style={{ fontSize: 36 }} />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div style={{ height: 100, textAlign: 'center', marginTop: 30 }}>
        <Text type="secondary">No data</Text>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 1.3}>
      <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <defs>
          {data.map((_, index) => (
            <linearGradient id={`myGradient${index}`} key={index}>
              <stop
                offset="0%"
                stopColor={COLORS[index % COLORS.length].start}
              />
              <stop
                offset="100%"
                stopColor={COLORS[index % COLORS.length].end}
              />
            </linearGradient>
          ))}
        </defs>
        <Pie
          isAnimationActive={false}
          data={data}
          startAngle={360}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="var(--primary-color)"
          paddingAngle={5}
          dataKey="count"
          nameKey="name"
          label={entry => entry.name}
        >
          {data.map((board, index) => (
            <Cell
              key={`cell-${board.name}`}
              fill={`url(#myGradient${index})`}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={value => {
            return <span>{((Number(value) / total) * 100).toFixed(0)}%</span>;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

const BoardsTable: React.FC<{
  username: string;
  data: any;
  loading: boolean;
  from: string | null;
  to: string | null;
}> = ({ username, data, loading, from, to }) => {
  const tableData = data
    ? data.boards.map(board => ({
        ...board,
        percentage: `${Math.floor(
          (Number(board.count) / data.total_results_with_board) * 100,
        )}%`,
      }))
    : [];

  const columns = [
    {
      title: 'Board',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Posts',
      dataIndex: 'count',
      key: 'count',
      width: 50,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 50,
    },
    {
      title: 'View Posts',
      dataIndex: 'view',
      key: 'view',
      width: 75,
      render: (text, record) => {
        const queryStringified = queryString.stringify(
          {
            author: username,
            board: record.key,
            after_date: from,
            before_date: to,
          },
          { skipEmptyString: true, skipNull: true },
        );

        return <Link to={`/search?${queryStringified}`}>View</Link>;
      },
    },
  ];

  return (
    <Table
      rowKey={record => record.name}
      columns={columns}
      dataSource={tableData}
      pagination={false}
      size="small"
      bordered
      loading={loading}
      locale={{ emptyText: 'No data...' }}
    />
  );
};

const BoardsActivityRow: React.FC<{ username: string }> = ({ username }) => {
  const [period, setPeriod] = useState('all-time');

  const getDatePeriod = datePeriod => {
    let from = null;
    let to = null;

    const dateUTC = addMinutes(new Date(), new Date().getTimezoneOffset());

    switch (datePeriod) {
      case 'all-time':
        from = null;
        to = null;
        break;
      case '30-days':
        from = sub(startOfDay(dateUTC), { months: 1 }).toISOString();
        to = endOfDay(dateUTC).toISOString();
        break;
      case '7-days':
        from = sub(startOfDay(dateUTC), { weeks: 1 }).toISOString();
        to = endOfDay(dateUTC).toISOString();
        break;
      default:
        break;
    }

    return [from, to];
  };

  const { data, refetch, isLoading, isFetching } = useQuery(
    `userBoards:${username}`,
    async () => {
      const [from, to] = getDatePeriod(period);

      const { data: responseData } = await api.get(
        `/users/${username}/boards`,
        { params: { from, to } },
      );

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  useEffect(() => {
    refetch();
  }, [period, refetch]);

  const [from, to] = getDatePeriod(period);

  return (
    <>
      <Col
        span={24}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text strong style={{ fontSize: 24 }}>
          Boards Activity
        </Text>
        <Radio.Group
          defaultValue="all-time"
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <Radio.Button value="all-time">All time</Radio.Button>
          <Radio.Button value="30-days">30 days</Radio.Button>
          <Radio.Button value="7-days">7 days</Radio.Button>
        </Radio.Group>
      </Col>
      <Col xs={24} lg={12}>
        <BoardsChart
          data={data?.data?.boards}
          total={data?.data?.total_results_with_board}
          loading={isLoading || isFetching}
        />
      </Col>
      <Col xs={24} lg={12}>
        <BoardsTable
          username={username}
          data={data?.data}
          loading={isLoading || isFetching}
          from={from}
          to={to}
        />
      </Col>
    </>
  );
};

const User: React.FC = () => {
  const { username, author_uid } = useRouteMatch().params as MatchParams;
  const history = useHistory();

  const isSmallScreen = useMediaQuery({ query: '(max-width: 767px)' });

  const { data, isLoading, isError } = useQuery(
    `user:${username || author_uid}`,
    async () => {
      const { data: responseData } = await api.get(
        username ? `users/${username}` : `users/id/${author_uid}`,
      );

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  return (
    <div>
      <Header />
      {isLoading || isError || !data?.data ? (
        <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
          {!isLoading && !isError && !data?.data ? (
            <Text>This user could not be found on our database.</Text>
          ) : null}
          {!isLoading && isError ? <Text>Something went wrong...</Text> : null}
          {isLoading ? <LoadingOutlined style={{ fontSize: 50 }} /> : null}
        </div>
      ) : (
        <PageContent>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10} lg={10}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: isSmallScreen ? 'center' : 'initial',
                }}
              >
                <UserAvatar author_uid={data.data.author_uid} />
                <Card.Meta
                  title={
                    <div>
                      <Title level={3} style={{ margin: 0 }}>
                        {data.data.author}
                      </Title>
                      <Typography.Link
                        style={{ fontSize: 16 }}
                        href={`https://bitcointalk.org/index.php?action=profile;u=${data.data.author_uid}`}
                      >
                        {data.data.author_uid}
                      </Typography.Link>
                    </div>
                  }
                />
              </div>
            </Col>
            <Col xs={12} md={6} lg={6}>
              <Statistic
                title="Scraped Posts"
                value={data.data.posts_count}
                valueRender={value => {
                  return isLoading ? <LoadingOutlined /> : value;
                }}
              />
            </Col>
            <Col xs={12} md={6} lg={6}>
              <Statistic
                title="Links"
                value={null}
                valueRender={() => (
                  <Button
                    onClick={() => history.push(`/search?author=${username}`)}
                  >
                    Search Posts
                  </Button>
                )}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={[24, 24]} align="stretch">
            <BoardsActivityRow username={data.data.author} />
          </Row>
          <Divider />
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Title level={3}>Posts in the last 7 days</Title>
              <PostsWeekChart username={data.data.author} />
            </Col>
            <Col xs={24} lg={12}>
              <Title level={3}>Posts in the last month</Title>
              <PostsMonthChart username={data.data.author} />
            </Col>
            <Divider />
            <Col span={24}>
              <Title level={3}>Posts per week (last year)</Title>
              <PostsYearChart username={data.data.author} />
            </Col>
            <Col span={24}>
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Favorite Topics" key="1">
                  <FavoriteTopics username={data.data.author} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Addresses" key="2">
                  <Card title="Top 5 Favorite Addresses">
                    <FavoriteAddresses username={data.data.author} />
                    <Divider />
                    <Title level={5}>All Mentioned Addresses</Title>
                    <MentionedAddresses username={data.data.author} />
                  </Card>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Deleted Posts" key="3">
                  <DeletedPosts username={data.data.author} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Edited Posts" key="4">
                  <EditedPosts username={data.data.author} />
                </Tabs.TabPane>
              </Tabs>
            </Col>
          </Row>
        </PageContent>
      )}
    </div>
  );
};

export default User;
