import React, { useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
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
  Collapse,
  Button,
} from 'antd';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { format, sub, isValid } from 'date-fns';
import { useMediaQuery } from 'react-responsive';

import { LoadingOutlined } from '@ant-design/icons';
import api from '../../services/api';

import Header from '../../components/Header';
import AddressCard from '../../components/AddressCard';

import { PageContent } from './styles';

interface BoardsData {
  name: string;
  count: number;
}

interface MatchParams {
  username: string;
}

interface BoardsChartProps {
  data: BoardsData[];
  total: number;
}

const UserAvatar: React.FC<{ author_uid: number }> = ({ author_uid }) => {
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [imageType, setImageType] = useState('png');
  const [loading, setLoading] = useState(true);

  const onLoad = () => {
    setAvatarSuccess(true);
    setLoading(false);
  };

  const onError = () => {
    if (imageType === 'jpg') return;
    setImageType('jpg');
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <Image
          src="data:image/png;base64,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"
          alt="User avatar"
          style={{
            marginRight: 15,
          }}
        />
      ) : null}
      <Image
        src={`https://bitcointalk.org/useravatars/avatar_${author_uid}.${imageType}`}
        alt="User avatar"
        onLoad={onLoad}
        onError={onError}
        style={{
          marginRight: 15,
          display: avatarSuccess ? 'initial' : 'none',
        }}
        fallback="data:image/png;base64,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"
      />
    </>
  );
};

const KnownAddressesCard: React.FC<{ username: string }> = ({ username }) => {
  const {
    data,
    isLoading,
    fetchMore,
    isFetchingMore,
    canFetchMore,
    isError,
  } = useInfiniteQuery(
    `userAddresses:${username}`,
    async (key, last = '') => {
      const { data: responseData } = await api.get(
        `/users/${username}/addresses?last=${last}&limit=20`,
      );

      return responseData;
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      getFetchMore: lastGroup => {
        if (lastGroup.length < 20) return false;

        const last = lastGroup[lastGroup.length - 1];
        return `${last.address},${last.created_at},${last.id}`;
      },
    },
  );

  if (isLoading) {
    return <LoadingOutlined style={{ color: '#fff' }} />;
  }

  if (isError) {
    return (
      <Collapse defaultActiveKey={1}>
        <Collapse.Panel header="Known Addresses" key={1} disabled>
          <Typography.Text type="secondary">
            No addresses were found in our database.
          </Typography.Text>
        </Collapse.Panel>
      </Collapse>
    );
  }

  const uniqueUsers = [];

  data.forEach(group => {
    group.forEach(address => {
      address.authors_uid.forEach(author_uid => {
        const exists = uniqueUsers.find(user => user === author_uid);

        if (!exists) {
          uniqueUsers.push(author_uid);
        }
      });
    });
  });

  return (
    <Collapse>
      <Collapse.Panel header="Known Addresses" key={1}>
        {data.map((group, groupIndex, array) => {
          return (
            <div>
              {group.map((address, i) => {
                return (
                  <AddressCard
                    data={address}
                    number={groupIndex * 20 + i + 1}
                    key={address.id}
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
                    <Typography.Text>You reached the end!</Typography.Text>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </Collapse.Panel>
    </Collapse>
  );
};

const PostsWeekChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = useQuery(
    `userPostsWeek:${username}`,
    async () => {
      const { data: responseData } = await api.get(`/users/${username}/posts`);

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const CustomizedAxisTick: React.FC<{
    x: string;
    y: string;
    payload: { value: string };
  }> = ({ x, y, payload }) => {
    if (!payload.value) {
      return (
        <text
          x={Number(x) + 4.5}
          y={Number(y) / 2}
          dy={-10}
          fontSize={15}
          fill="#757575"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          No data
        </text>
      );
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={36} y={0} dy={16} textAnchor="end" fill="#666">
          {format(new Date(payload.value), 'yyyy/MM/dd')}
        </text>
      </g>
    );
  };

  if (isLoading) {
    return <LoadingOutlined style={{ color: '#fff' }} />;
  }

  // if (isError) {
  //   return <Typography.Text type="secondary">No data</Typography.Text>;
  // }

  return (
    <>
      <ResponsiveContainer width="100%" aspect={2 / 1}>
        <LineChart
          data={isError ? [{ value: null }] : data.intervals}
          margin={{ top: 0, left: -55, right: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="key_as_string"
            tick={({ x, y, payload }) => (
              <CustomizedAxisTick x={x} y={y} payload={payload} />
            )}
            domain={['dataMin', 'dataMax']}
            interval={1}
          />
          <YAxis dataKey="doc_count" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1D1D1D' }}
            label="{timeTaken}"
            labelFormatter={value =>
              `Day: ${
                isValid(new Date(value))
                  ? format(new Date(value), 'yyyy/MM/dd')
                  : null
              }`
            }
            formatter={value => [value, 'Posts']}
          />
          <Line type="monotone" dataKey="doc_count" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

const PostsMonthChart: React.FC<{ username: string }> = ({ username }) => {
  const { data, isLoading, isError } = useQuery(
    `userPostsMonth:${username}`,
    async () => {
      const oneMonthAgo = sub(new Date(), { months: 1 }).toISOString();

      const { data: responseData } = await api.get(
        `/users/${username}/posts?from=${oneMonthAgo}`,
      );

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const CustomizedAxisTick: React.FC<{
    x: string;
    y: string;
    payload: { value: string };
  }> = ({ x, y, payload }) => {
    if (!payload.value) {
      return (
        <text
          x={Number(x) + 4.5}
          y={Number(y) / 2}
          dy={-10}
          fontSize={15}
          fill="#757575"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          No data
        </text>
      );
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={36} y={0} dy={16} textAnchor="end" fill="#666">
          {format(new Date(payload.value), 'yyyy/MM/dd')}
        </text>
      </g>
    );
  };

  if (isLoading) {
    return <LoadingOutlined style={{ color: '#fff' }} />;
  }

  // if (isError) {
  //   return <Typography.Text type="secondary">No data</Typography.Text>;
  // }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 1}>
      <LineChart
        data={isError ? [{ value: null }] : data.intervals}
        margin={{ top: 0, left: -55, right: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="key_as_string"
          tick={({ x, y, payload }) => (
            <CustomizedAxisTick x={x} y={y} payload={payload} />
          )}
          domain={['dataMin', 'dataMax']}
          interval={6}
        />
        <YAxis dataKey="doc_count" />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1D1D1D' }}
          label="{timeTaken}"
          labelFormatter={value =>
            isValid(new Date(value))
              ? `Day: ${format(new Date(value), 'yyyy/MM/dd')}`
              : null
          }
          formatter={value => [value, 'Posts']}
        />
        <Line type="monotone" dataKey="doc_count" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const BoardsChart: React.FC<BoardsChartProps> = ({ data, total }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!data || !total) {
    return <Typography.Text type="secondary">No data</Typography.Text>;
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 1.3}>
      <PieChart margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <Pie
          isAnimationActive={false}
          data={data}
          startAngle={360}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="count"
          nameKey="name"
          label={entry => entry.name}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={COLORS[index % COLORS.length]}
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

const BoardsTable: React.FC<BoardsChartProps> = ({ data, total }) => {
  if (!data || !total) {
    return <></>;
  }

  const tableData = data.map(entry => ({
    ...entry,
    percentage: `${((Number(entry.count) / total) * 100).toFixed(0)}%`,
  }));

  const columns = [
    {
      title: 'Board',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Posts',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
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
    />
  );
};

const User: React.FC = () => {
  const { username } = useRouteMatch().params as MatchParams;

  const isSmallScreen = useMediaQuery({ query: '(max-width: 767px)' });

  const { data, isLoading, isError } = useQuery(
    `user:${username}`,
    async () => {
      const { data: responseData } = await api.get(`/users/${username}`);

      return responseData;
    },
    { retry: false, refetchOnWindowFocus: false, refetchOnMount: false },
  );

  const favoriteBoard = data && data.boards[0] ? data.boards[0].name : '?';

  return (
    <>
      <Header />
      {isLoading || isError ? (
        <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
          {isError ? (
            <Typography.Text>
              This user could not be found in our database.
            </Typography.Text>
          ) : (
            <LoadingOutlined style={{ fontSize: 50, color: '#fff' }} />
          )}
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
                <UserAvatar author_uid={data.user.author_uid} />
                <Card.Meta
                  title={
                    <div>
                      <Typography.Title level={3} style={{ margin: 0 }}>
                        {data.user.author}
                      </Typography.Title>
                      <Typography.Link
                        style={{ fontSize: 16 }}
                        href={`https://bitcointalk.org/index.php?action=profile;u=${data.user.author_uid}`}
                      >
                        {data.user.author_uid}
                      </Typography.Link>
                    </div>
                  }
                />
              </div>
            </Col>
            <Col xs={12} md={6} lg={6}>
              <Statistic title="Posts Scrapped" value={data.posts_count} />
            </Col>
            <Col xs={12} md={8} lg={8}>
              <Statistic title="Favorite Board" value={favoriteBoard} />
            </Col>
          </Row>
          <Divider />
          <Row gutter={[24, 24]} align="stretch">
            <Col span={24}>
              <Typography.Text style={{ fontSize: 24, fontWeight: 500 }}>
                Boards Activity
              </Typography.Text>
            </Col>
            <Col xs={24} lg={11}>
              <BoardsChart data={data.boards} total={data.total_boards} />
            </Col>
            <Col xs={24} lg={13}>
              <BoardsTable data={data.boards} total={data.total_boards} />
            </Col>
          </Row>
          <Divider />
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Typography.Title level={3}>
                Posts in the last 7 days
              </Typography.Title>
              <PostsWeekChart username={data.user.author} />
            </Col>
            <Col xs={24} lg={12}>
              <Typography.Title level={3}>
                Posts in the last month
              </Typography.Title>
              <PostsMonthChart username={data.user.author} />
            </Col>
            <Col span={24}>
              <KnownAddressesCard username={data.user.author} />
            </Col>
          </Row>
        </PageContent>
      )}
    </>
  );
};

export default User;
