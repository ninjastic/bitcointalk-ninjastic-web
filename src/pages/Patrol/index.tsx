import React from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';
import { LoadingOutlined } from '@ant-design/icons';
import { Divider, Card, Typography, Tabs, Row, Col, Table } from 'antd';
import { Link } from 'react-router-dom';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { format, addMinutes } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts';

import api from '../../services/api';

import Header from '../../components/Header';
import PostCard from '../../components/PostCard';

import { PageContent } from './styles';

const { Text, Title } = Typography;

const LastDeletedPosts: React.FC = () => {
  const {
    data,
    isLoading,
    canFetchMore,
    fetchMore,
    isFetching,
  } = useInfiniteQuery(
    'lastDeletedPosts',
    async (key, last = '') => {
      const { data: responseData } = await api.get(
        `posts/history?deleted=true&last=${last}`,
      );

      return responseData;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getFetchMore: lastGroup => {
        if (lastGroup.data.posts_history.length < 20) return false;

        return lastGroup.data.posts_history[
          lastGroup.data.posts_history.length - 1
        ].created_at;
      },
    },
  );

  useBottomScrollListener(() => {
    if (!canFetchMore || isFetching) return;

    fetchMore();
  }, 500);

  const LoadingMoreCard = ({ groupIndex }) => {
    if (groupIndex === data.length - 1) {
      return canFetchMore ? (
        <Card loading style={{ marginTop: 30 }} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: 25 }}>
          <Text>You reached the end!</Text>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 15, textAlign: 'center' }}>
        <LoadingOutlined style={{ fontSize: 50 }} />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 500 }}>
          Last Deleted Posts
        </Text>
        <Text type="secondary">within 5 minutes of created</Text>
      </div>
      {data &&
        data.map((group, groupIndex) => {
          if (!group.data.posts_history.length) {
            return (
              <div style={{ textAlign: 'center' }} key="NoResults">
                <Text type="secondary">No results.</Text>
              </div>
            );
          }

          return group.data.posts_history.map((post, i, array) => {
            return (
              <div style={{ marginBottom: 30 }} key={post.post_id}>
                <PostCard data={post} number={groupIndex * 100 + i + 1} />
                <Divider />
                {i === array.length - 1 ? (
                  <LoadingMoreCard groupIndex={groupIndex} />
                ) : null}
              </div>
            );
          });
        })}
    </>
  );
};

const TopTopicsLineChart: React.FC = () => {
  const COLORS = [
    'var(--primary-color)',
    '#FF5733',
    '#25F9DC',
    '#F9258C',
    '#61E74C',
    '#4CB6E7',
    '#E74C4C',
    '#DFDFDF',
    '#DF8BFF',
    '#F3BA90',
  ];

  const formatDate = (value: string, dateFormat: string) => {
    const date = new Date(value);
    return format(addMinutes(date, date.getTimezoneOffset()), dateFormat);
  };

  const { data, isLoading } = useQuery(
    'topTopics',
    async () => {
      const { data: responseData } = await api.get('/posts/topics/top');

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
        <LoadingOutlined style={{ fontSize: 32 }} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 0.5}>
      <LineChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="key_as_string"
          allowDuplicatedCategory={false}
          tickFormatter={value => formatDate(value, 'HH:mm')}
        />
        <YAxis dataKey="doc_count" allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--popover-background)' }}
          labelFormatter={(value: string) => {
            const date = formatDate(value, 'HH:mm');
            return `${date} (UTC)`;
          }}
          wrapperStyle={{ zIndex: 1000 }}
        />
        {data?.data.map((d, i) => (
          <Line
            dataKey="doc_count"
            stroke={COLORS[i]}
            type="monotone"
            data={d.timestamps}
            name={d.title}
            key={d.topic_id}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

const TopTopicsTable: React.FC = () => {
  const { data, isLoading } = useQuery(
    'topTopics',
    async () => {
      const { data: responseData } = await api.get('/posts/topics/top');

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const tableData = data?.data.map(d => ({
    title: d.title,
    topic_id: d.topic_id,
    count: d.timestamps.reduce((p, c) => p + c.doc_count, 0),
  }));

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
      width: 150,
    },
    {
      title: 'View Stats',
      dataIndex: 'topic_id',
      key: 'topic_id',
      width: 150,
      render: text => <Link to={`/topic/${text}`}>View</Link>,
    },
  ];

  return (
    <Table
      bordered
      size="small"
      dataSource={tableData}
      columns={columns}
      loading={isLoading}
      pagination={false}
      rowKey="topic_id"
    />
  );
};

const TopUsersLineChart: React.FC = () => {
  const COLORS = [
    'var(--primary-color)',
    '#FF5733',
    '#25F9DC',
    '#F9258C',
    '#61E74C',
    '#4CB6E7',
    '#E74C4C',
    '#DFDFDF',
    '#DF8BFF',
    '#F3BA90',
  ];

  const formatDate = (value: string, dateFormat: string) => {
    const date = new Date(value);
    return format(addMinutes(date, date.getTimezoneOffset()), dateFormat);
  };

  const { data, isLoading } = useQuery(
    'topAuthors',
    async () => {
      const { data: responseData } = await api.get('/posts/authors/top');

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
        <LoadingOutlined style={{ fontSize: 32 }} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 0.5}>
      <LineChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="key_as_string"
          allowDuplicatedCategory={false}
          tickFormatter={value => formatDate(value, 'HH:mm')}
        />
        <YAxis dataKey="doc_count" allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--popover-background)' }}
          labelFormatter={(value: string) => {
            const date = formatDate(value, 'HH:mm');
            return `${date} (UTC)`;
          }}
          wrapperStyle={{ zIndex: 1000 }}
        />
        {data?.data.map((d, i) => (
          <Line
            dataKey="doc_count"
            stroke={COLORS[i]}
            type="monotone"
            data={d.timestamps}
            name={d.author}
            key={d.author}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

const TopUsersTable: React.FC = () => {
  const { data, isLoading } = useQuery(
    'topAuthors',
    async () => {
      const { data: responseData } = await api.get('/posts/authors/top');

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const tableData = data?.data.map(d => ({
    author: d.author,
    count: d.timestamps.reduce((p, c) => p + c.doc_count, 0),
  }));

  const columns = [
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: text => <Link to={`/user/${text}`}>{text}</Link>,
    },
    {
      title: 'Posts',
      dataIndex: 'count',
      key: 'count',
      width: 150,
    },
    {
      title: 'View Posts',
      dataIndex: 'author',
      key: 'view-posts',
      width: 150,
      render: text => <Link to={`/search?author=${text}`}>View</Link>,
    },
  ];

  return (
    <Table
      bordered
      size="small"
      dataSource={tableData}
      columns={columns}
      loading={isLoading}
      pagination={false}
      rowKey="author"
    />
  );
};

const TopBoardsLineChart: React.FC = () => {
  const COLORS = [
    'var(--primary-color)',
    '#FF5733',
    '#25F9DC',
    '#F9258C',
    '#61E74C',
    '#4CB6E7',
    '#E74C4C',
    '#DFDFDF',
    '#DF8BFF',
    '#F3BA90',
  ];

  const formatDate = (value: string, dateFormat: string) => {
    const date = new Date(value);
    return format(addMinutes(date, date.getTimezoneOffset()), dateFormat);
  };

  const { data, isLoading } = useQuery(
    'topBoards',
    async () => {
      const { data: responseData } = await api.get('/boards/top');

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return (
      <div style={{ width: '100%', marginTop: 30, textAlign: 'center' }}>
        <LoadingOutlined style={{ fontSize: 32 }} />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 0.5}>
      <LineChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="key_as_string"
          allowDuplicatedCategory={false}
          tickFormatter={value => formatDate(value, 'HH:mm')}
        />
        <YAxis dataKey="doc_count" allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--popover-background)' }}
          labelFormatter={(value: string) => {
            const date = formatDate(value, 'HH:mm');
            return `${date} (UTC)`;
          }}
          wrapperStyle={{ zIndex: 1000 }}
        />
        {data?.data.map((d, i) => (
          <Line
            dataKey="doc_count"
            stroke={COLORS[i]}
            type="monotone"
            data={d.timestamps}
            name={d.board_name}
            key={d.board_id}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

const TopBoardsTable: React.FC = () => {
  const { data, isLoading } = useQuery(
    'topBoards',
    async () => {
      const { data: responseData } = await api.get('/boards/top');

      return responseData;
    },
    { retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
  );

  const tableData = data?.data.map(d => ({
    board_name: d.board_name,
    board_id: d.board_id,
    count: d.timestamps.reduce((p, c) => p + c.doc_count, 0),
  }));

  const columns = [
    {
      title: 'Name',
      dataIndex: 'board_name',
      key: 'board_name',
    },
    {
      title: 'Posts',
      dataIndex: 'count',
      key: 'count',
      width: 150,
    },
    {
      title: 'View Posts',
      dataIndex: 'board_id',
      key: 'view-posts',
      width: 150,
      render: text => <Link to={`/search?board=${text}`}>View</Link>,
    },
  ];

  return (
    <Table
      bordered
      size="small"
      dataSource={tableData}
      columns={columns}
      loading={isLoading}
      pagination={false}
      rowKey="board_id"
    />
  );
};

const Patrol: React.FC = () => {
  return (
    <>
      <Header />
      <PageContent>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Activity" key={1}>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Title level={3}>Top 10 Topics in the last 24 hours</Title>
                <TopTopicsLineChart />
              </Col>
              <Col span={24}>
                <TopTopicsTable />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Title level={3}>Top 10 Users in the last 24 hours</Title>
                <TopUsersLineChart />
              </Col>
              <Col span={24}>
                <TopUsersTable />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Title level={3}>Top 10 Boards in the last 24 hours</Title>
                <TopBoardsLineChart />
              </Col>
              <Col span={24}>
                <TopBoardsTable />
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Last Deleted Posts" key="2">
            <LastDeletedPosts />
          </Tabs.TabPane>
        </Tabs>
      </PageContent>
    </>
  );
};

export default Patrol;
