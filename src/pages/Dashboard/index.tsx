import React from 'react';
import { Typography, Row, Col, Divider, Statistic } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  isValid,
  format,
  addMinutes,
  sub,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { useMediaQuery } from 'react-responsive';

import api from '../../services/api';

import Header from '../../components/Header';
import AlertMessage from '../../components/AlertMessage';

import { PageContent } from './styles';

const { Title } = Typography;

const PostsTodayCard: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerHourToday',
    async () => {
      const currentDate = new Date();

      const currentDateUTC = addMinutes(
        currentDate,
        currentDate.getTimezoneOffset(),
      );
      const yesterdayDateUTC = sub(currentDateUTC, { days: 1 });

      const { data: responseData } = await api.get(
        `/posts/count?from=${yesterdayDateUTC.toISOString()}&to=${currentDateUTC.toISOString()}`,
      );

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  const totalCount = data?.data?.reduce((prev, current) => {
    return prev + current.doc_count;
  }, 0);

  return (
    <Statistic
      title="Posts 24h"
      value={totalCount}
      valueRender={value => (isLoading ? <LoadingOutlined /> : value)}
    />
  );
};

const PostsLast24HoursGraph: React.FC = () => {
  const isSmallScreen = useMediaQuery({ query: '(max-width: 991px)' });

  const { data, isLoading } = useQuery(
    'postsPerHourLast24h',
    async () => {
      const { data: responseData } = await api.get('/posts/count');

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  if (isLoading) {
    return <LoadingOutlined style={{ color: '#fff', fontSize: 24 }} />;
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / (isSmallScreen ? 1 : 0.5)}>
      <LineChart data={data?.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="key_as_string"
          tickFormatter={value => {
            const date = new Date(value);
            return format(addMinutes(date, date.getTimezoneOffset()), 'HH:mm');
          }}
        />
        <YAxis dataKey="doc_count" allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1D1D1D' }}
          label="{timeTaken}"
          labelFormatter={value => {
            const date = new Date(value);
            const formatted = format(
              addMinutes(date, date.getTimezoneOffset()),
              'HH:mm',
            );

            return `${isValid(new Date(value)) ? formatted : null} (UTC)`;
          }}
          formatter={value => [value, 'Posts']}
        />
        <Line dataKey="doc_count" stroke="#8884d8" type="monotone" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const PostsPerDayGraph: React.FC = () => {
  const { data, isLoading } = useQuery(
    'postsPerDay',
    async () => {
      const currentDate = new Date();

      const currentDateUTC = addMinutes(
        currentDate,
        currentDate.getTimezoneOffset(),
      );

      const lastWeekDateUTC = sub(startOfDay(currentDateUTC), { months: 1 });
      const yesterdayDateUTC = sub(endOfDay(currentDateUTC), { days: 1 });

      const { data: responseData } = await api.get(
        `/posts/count?from=${lastWeekDateUTC.toISOString()}&to=${yesterdayDateUTC.toISOString()}&interval=1d`,
      );

      responseData.data.pop();

      return responseData;
    },
    { refetchOnMount: false, refetchOnWindowFocus: false, retry: false },
  );

  if (isLoading) {
    return <LoadingOutlined style={{ color: '#fff', fontSize: 24 }} />;
  }

  return (
    <ResponsiveContainer width="100%" aspect={2 / 1}>
      <LineChart data={data?.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="key_as_string"
          tickFormatter={value => {
            const date = new Date(value);
            return format(addMinutes(date, date.getTimezoneOffset()), 'MM/dd');
          }}
        />
        <YAxis dataKey="doc_count" allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1D1D1D' }}
          label="{timeTaken}"
          labelFormatter={value => {
            const date = new Date(value);
            const formatted = format(
              addMinutes(date, date.getTimezoneOffset()),
              'MM/dd',
            );

            return `${isValid(new Date(value)) ? formatted : null} (UTC)`;
          }}
          formatter={value => [value, 'Posts']}
        />
        <Line dataKey="doc_count" stroke="#8884d8" type="monotone" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const Dashboard: React.FC = () => {
  return (
    <>
      <Header />
      <PageContent>
        <AlertMessage />
        <Row gutter={[24, 24]}>
          <Col xs={12} lg={8}>
            <PostsTodayCard />
          </Col>
          <Col xs={12} lg={8}>
            <Statistic title="Archived Posts" value="43 mil+" />
          </Col>
        </Row>
        <Divider />
        <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
          <Col xs={24} lg={12}>
            <Title level={3}>Posts per day</Title>
            <PostsPerDayGraph />
          </Col>
        </Row>
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Title level={3}>Posts in the last 24 hours</Title>
            <PostsLast24HoursGraph />
          </Col>
        </Row>
      </PageContent>
    </>
  );
};

export default Dashboard;
